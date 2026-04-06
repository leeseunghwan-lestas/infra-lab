terraform {
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

resource "local_file" "deployment" {
  filename = "../k8s/deployment.yaml"
  content  = <<-EOT
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: ${var.app_name}-deployment
    spec:
      replicas: ${var.replicas}
      selector:
        matchLabels:
          app: ${var.app_name}
      template:
        metadata:
          labels:
            app: ${var.app_name}
        spec:
          containers:
            - name: ${var.app_name}
              image: ${var.app_name}:latest
              imagePullPolicy: Never
              env:
                - name: APP_ENV
                  value: "${var.environment}"
              ports:
                - containerPort: 3000
  EOT
}

resource "local_file" "service" {
  filename = "../k8s/service.yaml"
  content  = <<-EOT
    apiVersion: v1
    kind: Service
    metadata:
      name: ${var.app_name}-service
    spec:
      selector:
        app: ${var.app_name}
      ports:
        - port: 80
          targetPort: 3000
      type: NodePort
  EOT
}