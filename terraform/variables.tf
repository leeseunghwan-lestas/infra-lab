variable "app_name" {
  description = "앱 이름"
  type        = string
  default     = "myapp"
}

variable "replicas" {
  description = "Pod 개수"
  type        = number
  default     = 3
}

variable "environment" {
  description = "배포 환경"
  type        = string
  default     = "development"
}