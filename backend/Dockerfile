# Build stage: Secure Maven Container
FROM maven:3.9.5-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom and source
COPY pom.xml .
COPY src src

# Build Protocol: Compile and package the Nexis Hub
RUN mvn clean package -DskipTests

# Run stage: Ultra-lightweight JRE environment
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the build artifact from build stage
COPY --from=build /app/target/*.jar app.jar

# Define ephemeral data node for H2
RUN mkdir -p /app/data && chmod 777 /app/data

# Exposure Protocol: Exposing internal port for Render uplink
EXPOSE 8080

# Execution Entrypoint
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urange", "-jar", "/app/app.jar"]
