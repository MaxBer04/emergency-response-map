import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import yaml from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get environment from command line or use dev as default
const environment = process.env.NODE_ENV || "dev";
console.log(`Deploying in ${environment} mode`);

// Services configuration with optional image target
const services = [
  {
    name: "frontend",
    path: "frontend",
    imageName:
      environment === "dev"
        ? "emergency-response-map/frontend-dev:latest"
        : "emergency-response-map/frontend-prod:latest",
  },
  {
    name: "api-gateway",
    path: "backend/api-gateway",
    imageName: "emergency-response-map/api-gateway:latest",
  },
  {
    name: "isochrone-service",
    path: "backend/isochrone-service",
    imageName: "emergency-response-map/isochrone-service:latest",
  },
  {
    name: "database-service",
    path: "database",
    imageName: "emergency-response-map/database-service:latest",
  },
];

// Process each service
services.forEach((service) => {
  const k8sDir = path.join(__dirname, service.path, "k8s");
  if (!fs.existsSync(k8sDir)) {
    console.log(`No k8s directory found for ${service.name}, skipping...`);
    return;
  }

  const yamlFiles = fs
    .readdirSync(k8sDir)
    .filter((file) => file.endsWith(".yaml") && !file.startsWith("_temp_"));

  yamlFiles.forEach((yamlFile) => {
    const yamlPath = path.join(k8sDir, yamlFile);
    const rawContent = fs.readFileSync(yamlPath, "utf8");

    // Split the file into YAML documents (if multiple are present)
    const documents = rawContent.split("---");
    const processedDocuments = [];

    documents.forEach((doc) => {
      if (!doc.trim()) return; // Skip empty documents

      try {
        // Parse the YAML document
        const parsedDoc = yaml.parse(doc);

        // Skip if not a valid document
        if (!parsedDoc) return;

        if (service.name === "frontend" && environment === "prod") {
          if (parsedDoc.kind === "Deployment") {
            if (parsedDoc.spec?.template?.spec?.containers) {
              const container = parsedDoc.spec.template.spec.containers.find(
                (c) => c.name === "frontend"
              );
              if (container) {
                // Always use port 80 for the service
                const portIndex = container.ports.findIndex((p) => p.containerPort === 3001);
                if (portIndex >= 0) {
                  container.ports[portIndex].containerPort = 80;
                }
              }
            }
          }

          // Update frontend service targetPort for production
          if (parsedDoc.kind === "Service") {
            const portIndex = parsedDoc.spec.ports.findIndex((p) => p.port === 80);
            if (portIndex >= 0) {
              parsedDoc.spec.ports[portIndex].targetPort = 80;
            }
          }
        }

        // Update image for Deployment
        if (parsedDoc.kind === "Deployment" && parsedDoc.metadata.name === service.name) {
          if (parsedDoc.spec?.template?.spec?.containers) {
            for (const container of parsedDoc.spec.template.spec.containers) {
              // Update the image to the service-specific image
              container.image = service.imageName;

              // Set NODE_ENV
              if (container.env) {
                const nodeEnvVar = container.env.find((env) => env.name === "NODE_ENV");
                if (nodeEnvVar) {
                  nodeEnvVar.value = environment;
                }

                // Add volume mounts for dev mode
                if (environment === "dev" && !container.volumeMounts) {
                  container.volumeMounts = [
                    {
                      name: "src",
                      mountPath: "/app/src",
                    },
                  ];
                }
              }
            }

            // Add volumes for dev mode
            if (environment === "dev" && !parsedDoc.spec.template.spec.volumes) {
              parsedDoc.spec.template.spec.volumes = [
                {
                  name: "src",
                  hostPath: {
                    path: path.resolve(__dirname, service.path, "src"),
                    type: "Directory",
                  },
                },
              ];
            }
          }
        }

        // Add the modified document
        processedDocuments.push(yaml.stringify(parsedDoc));
      } catch (err) {
        // If parsing fails, just use the original document
        console.error(`Error parsing YAML document in ${yamlFile}:`);
        console.error(`Document content: "${doc.slice(0, 100)}..."`);
        console.error(err);
        processedDocuments.push(doc);
      }
    });

    // Combine the documents back together
    const processedContent = processedDocuments.join("\n---\n");

    // Write processed file to a temp location
    const tempFile = path.join(k8sDir, `_temp_${yamlFile}`);
    fs.writeFileSync(tempFile, processedContent);

    // Apply the processed configuration
    console.log(`Applying ${service.name} configuration...`);
    try {
      execSync(`kubectl apply -f ${tempFile}`, { stdio: "inherit" });
      // Clean up temp file after successful deployment
      fs.unlinkSync(tempFile);
    } catch (error) {
      console.error(
        `Error applying ${service.name} configuration. Check the generated YAML file: ${tempFile}`
      );
      console.error(`Error details: ${error.message}`);
      // Don't delete the temp file for inspection
    }
  });
});

// ================ Ingress Management ================
console.log(`\nSetting up ingress...`);

const k8sInfraDir = path.join(__dirname, "infrastructure", "k8s");
ensureDir(k8sInfraDir);

const setupIngress = async () => {
  try {
    // Apply the ingress controller
    console.log("Setting up ingress controller...");
    const nginxIngressFile = path.join(k8sInfraDir, "ingress-nginx.yaml");
    execSync(`kubectl apply -f ${nginxIngressFile}`, { stdio: "inherit" });

    // Apply the routing rules
    console.log("Setting up ingress routing rules...");
    const mainIngressFile = path.join(k8sInfraDir, "main-ingress.yaml");
    execSync(`kubectl apply -f ${mainIngressFile}`, { stdio: "inherit" });

    console.log("\nIngress setup complete!");

    if (environment === "dev") {
      console.log(`[DEV] Your application should be available at http://localhost`);
    } else {
      console.log(
        `[PROD] Your application will be available via the LoadBalancer endpoint once provisioned`
      );
    }
  } catch (error) {
    console.error("Error setting up ingress:", error.message);
  }
};

// Helper function
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

await setupIngress();

console.log(`${environment} environment deployed successfully!`);
console.log("Setting up port forwarding to access the frontend at http://localhost:80");
