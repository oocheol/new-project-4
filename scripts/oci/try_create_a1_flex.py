import argparse
import json
import os
import sys
from pathlib import Path

import oci
from oci.exceptions import ConfigFileNotFound, InvalidConfig, ServiceError


REQUIRED_ENV = (
    "OCI_COMPARTMENT_ID",
    "OCI_AVAILABILITY_DOMAIN",
    "OCI_SUBNET_ID",
    "OCI_IMAGE_ID",
    "OCI_SSH_PUBLIC_KEY_FILE",
)


def emit(status, **details):
    print(json.dumps({"status": status, **details}, ensure_ascii=False))


def env(name, default=None):
    value = os.environ.get(name)
    if value is None or value.strip() == "":
        return default
    return value.strip()


def parse_float_env(name, default):
    value = env(name)
    if value is None:
        return default
    try:
        return float(value)
    except ValueError:
        raise ValueError(f"{name} must be a number")


def parse_int_env(name, default):
    value = env(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        raise ValueError(f"{name} must be an integer")


def load_config():
    config_file = env("OCI_CONFIG_FILE", str(Path.home() / ".oci" / "config"))
    profile = env("OCI_PROFILE", "DEFAULT")

    config = oci.config.from_file(config_file, profile_name=profile)
    region = env("OCI_REGION")
    if region:
        config["region"] = region
    oci.config.validate_config(config)
    return config, config_file, profile


def is_capacity_or_limit_error(error):
    text = " ".join(
        str(part)
        for part in (
            getattr(error, "code", ""),
            getattr(error, "message", ""),
            getattr(error, "status", ""),
        )
    ).lower()
    markers = (
        "out of host capacity",
        "capacity",
        "limitexceeded",
        "limit exceeded",
        "quota",
        "notauthorizedorresourcealreadyexists",
    )
    return any(marker in text for marker in markers)


def build_launch_details():
    ssh_key_file = Path(env("OCI_SSH_PUBLIC_KEY_FILE", "")).expanduser()
    ssh_key = ssh_key_file.read_text(encoding="utf-8").strip()

    shape = env("OCI_SHAPE", "VM.Standard.A1.Flex")
    ocpus = parse_float_env("OCI_OCPUS", 1.0)
    memory_gb = parse_float_env("OCI_MEMORY_GB", 6.0)
    boot_volume_gb = parse_int_env("OCI_BOOT_VOLUME_GB", 50)
    display_name = env("OCI_INSTANCE_DISPLAY_NAME", "always-free-a1-flex")

    return oci.core.models.LaunchInstanceDetails(
        compartment_id=env("OCI_COMPARTMENT_ID"),
        availability_domain=env("OCI_AVAILABILITY_DOMAIN"),
        subnet_id=env("OCI_SUBNET_ID"),
        display_name=display_name,
        shape=shape,
        shape_config=oci.core.models.LaunchInstanceShapeConfigDetails(
            ocpus=ocpus,
            memory_in_gbs=memory_gb,
        ),
        source_details=oci.core.models.InstanceSourceViaImageDetails(
            image_id=env("OCI_IMAGE_ID"),
            boot_volume_size_in_gbs=boot_volume_gb,
        ),
        metadata={"ssh_authorized_keys": ssh_key},
    )


def main():
    parser = argparse.ArgumentParser(description="Try to create an Oracle Always Free A1.Flex VM.")
    parser.add_argument("--dry-run", action="store_true", help="Validate local config without creating an instance.")
    args = parser.parse_args()

    missing = [name for name in REQUIRED_ENV if not env(name)]
    if missing:
        emit("MISSING_CONFIG", missing=missing)
        return 3

    ssh_key_file = Path(env("OCI_SSH_PUBLIC_KEY_FILE", "")).expanduser()
    if not ssh_key_file.exists():
        emit("MISSING_CONFIG", missing=["OCI_SSH_PUBLIC_KEY_FILE"], message=f"File not found: {ssh_key_file}")
        return 3

    try:
        config, config_file, profile = load_config()
        launch_details = build_launch_details()
    except (ConfigFileNotFound, InvalidConfig, ValueError, OSError) as error:
        emit("MISSING_CONFIG", message=str(error))
        return 3

    if args.dry_run:
        emit(
            "DRY_RUN",
            configFile=config_file,
            profile=profile,
            region=config.get("region"),
            displayName=launch_details.display_name,
            shape=launch_details.shape,
            ocpus=launch_details.shape_config.ocpus,
            memoryGb=launch_details.shape_config.memory_in_gbs,
            bootVolumeGb=launch_details.source_details.boot_volume_size_in_gbs,
            e2Untouched=True,
        )
        return 0

    try:
        compute = oci.core.ComputeClient(config)
        response = compute.launch_instance(launch_details)
        instance = response.data
        emit(
            "SUCCESS",
            id=instance.id,
            displayName=instance.display_name,
            shape=instance.shape,
            lifecycleState=instance.lifecycle_state,
            region=config.get("region"),
            e2Untouched=True,
        )
        return 0
    except ServiceError as error:
        if is_capacity_or_limit_error(error):
            emit("NO_CAPACITY", code=error.code, message=error.message)
            return 2
        emit("ERROR", code=error.code, message=error.message)
        return 1


if __name__ == "__main__":
    sys.exit(main())
