FROM gradle:8.12.1-jdk17 AS build

WORKDIR /app
COPY build.gradle settings.gradle ./
RUN gradle --no-daemon dependencies
COPY src ./src
RUN gradle --no-daemon clean bootJar -x test

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:InitialRAMPercentage=40 -XX:+ExitOnOutOfMemoryError"
CMD ["java", "-jar", "app.jar"]
