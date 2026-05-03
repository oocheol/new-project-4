# Oracle Always Free Deployment

This project can run on one Oracle Always Free Ampere A1 VM with Docker Compose:

- Caddy: public HTTPS reverse proxy
- API: Spring Boot service
- DB: PostgreSQL with a persistent Docker volume

## Free-Tier Shape

Preferred Always Free shape:

- Image: Ubuntu 22.04 or 24.04
- Shape: `VM.Standard.A1.Flex`
- OCPU: `1`
- Memory: `6 GB` or less
- Boot volume: default `50 GB`

This stays within the Always Free Ampere A1 and block volume limits.

If Ampere A1 capacity is temporarily unavailable, `VM.Standard.E2.1.Micro` can be used as a fallback. It has only 1 GB RAM, so this repository's Oracle Compose file keeps Java and PostgreSQL memory small. It is enough for a tiny MVP, but A1 is still strongly preferred.

## Network

Open these ingress ports in the VM security list or network security group:

```text
22/tcp
80/tcp
443/tcp
```

Do not expose PostgreSQL (`5432`) publicly.

## VM Setup

SSH into the VM, then install Docker:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu
```

Log out and SSH back in so the `docker` group applies.

## App Deploy

Clone and configure:

```bash
git clone https://github.com/oocheol/new-project-4.git
cd new-project-4
cp infra/oracle/.env.example infra/oracle/.env
```

Edit `infra/oracle/.env`:

```text
POSTGRES_PASSWORD=<long-random-password>
ALLOWED_ORIGINS=https://web-seven-iota-63.vercel.app
API_HOST=api.<your-vm-public-ip>.sslip.io
```

Deploy:

```bash
docker compose --env-file infra/oracle/.env -f infra/oracle/docker-compose.yml up -d --build
```

Check:

```bash
docker compose --env-file infra/oracle/.env -f infra/oracle/docker-compose.yml ps
docker compose --env-file infra/oracle/.env -f infra/oracle/docker-compose.yml logs -f api
curl https://api.<your-vm-public-ip>.sslip.io/api/health
```

## Frontend

Set Vercel's production environment variable:

```text
VITE_API_BASE_URL=https://api.<your-vm-public-ip>.sslip.io
```

Then redeploy the frontend.
