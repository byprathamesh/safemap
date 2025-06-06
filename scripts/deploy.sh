#!/bin/bash

# Safe Map Deployment Script
# Supports staging and production environments for India deployment

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Default values
ENVIRONMENT=""
SKIP_TESTS=false
SKIP_BUILD=false
DRY_RUN=false
VERBOSE=false

# AWS/GCP Configuration for India
AWS_REGION="ap-south-1"  # Mumbai region
GCP_REGION="asia-south1" # Mumbai region

print_usage() {
    echo "Usage: $0 [OPTIONS] ENVIRONMENT"
    echo ""
    echo "ENVIRONMENT:"
    echo "  staging     Deploy to staging environment"
    echo "  production  Deploy to production environment"
    echo ""
    echo "OPTIONS:"
    echo "  -s, --skip-tests    Skip running tests"
    echo "  -b, --skip-build    Skip building applications"
    echo "  -d, --dry-run       Show what would be deployed without executing"
    echo "  -v, --verbose       Enable verbose output"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 staging                    # Deploy to staging"
    echo "  $0 production --skip-tests    # Deploy to production without tests"
    echo "  $0 staging --dry-run          # Preview staging deployment"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}[VERBOSE]${NC} $1"
    fi
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check required tools
    local required_tools=("docker" "kubectl" "aws" "gcloud" "node" "npm")
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is required but not installed"
            exit 1
        fi
        log_verbose "$tool is available"
    done
    
    # Check environment variables
    local required_env_vars=(
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
        "GOOGLE_APPLICATION_CREDENTIALS"
    )
    
    for var in "${required_env_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Environment variable $var is required"
            exit 1
        fi
        log_verbose "$var is set"
    done
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    log_success "All prerequisites check passed"
}

load_environment_config() {
    local env_file="$PROJECT_ROOT/infrastructure/environments/$ENVIRONMENT.env"
    
    if [ ! -f "$env_file" ]; then
        log_error "Environment file not found: $env_file"
        exit 1
    fi
    
    log_info "Loading environment configuration for $ENVIRONMENT"
    source "$env_file"
    
    # Validate required environment variables
    if [ -z "$CLUSTER_NAME" ] || [ -z "$NAMESPACE" ]; then
        log_error "CLUSTER_NAME and NAMESPACE must be defined in environment file"
        exit 1
    fi
    
    log_verbose "Cluster: $CLUSTER_NAME"
    log_verbose "Namespace: $NAMESPACE"
    log_verbose "Region: $AWS_REGION"
}

run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        log_warning "Skipping tests as requested"
        return 0
    fi
    
    log_info "Running tests..."
    
    # Backend tests
    log_info "Running backend tests..."
    cd "$PROJECT_ROOT/backend"
    if [ "$DRY_RUN" = false ]; then
        npm test
    else
        log_verbose "DRY RUN: Would run 'npm test' in backend"
    fi
    
    # Dashboard tests
    log_info "Running dashboard tests..."
    cd "$PROJECT_ROOT/dashboard"
    if [ "$DRY_RUN" = false ]; then
        npm test
    else
        log_verbose "DRY RUN: Would run 'npm test' in dashboard"
    fi
    
    # Mobile tests
    log_info "Running mobile tests..."
    cd "$PROJECT_ROOT/mobile"
    if [ "$DRY_RUN" = false ]; then
        flutter test
    else
        log_verbose "DRY RUN: Would run 'flutter test' in mobile"
    fi
    
    # Integration tests
    log_info "Running integration tests..."
    cd "$PROJECT_ROOT/tests"
    if [ "$DRY_RUN" = false ]; then
        npm test
    else
        log_verbose "DRY RUN: Would run integration tests"
    fi
    
    cd "$PROJECT_ROOT"
    log_success "All tests passed"
}

build_applications() {
    if [ "$SKIP_BUILD" = true ]; then
        log_warning "Skipping build as requested"
        return 0
    fi
    
    log_info "Building applications..."
    
    # Build backend
    log_info "Building backend..."
    cd "$PROJECT_ROOT/backend"
    if [ "$DRY_RUN" = false ]; then
        npm run build
        docker build -t safemap-backend:$TIMESTAMP .
        docker tag safemap-backend:$TIMESTAMP safemap-backend:latest
    else
        log_verbose "DRY RUN: Would build backend Docker image"
    fi
    
    # Build dashboard
    log_info "Building dashboard..."
    cd "$PROJECT_ROOT/dashboard"
    if [ "$DRY_RUN" = false ]; then
        npm run build
        docker build -t safemap-dashboard:$TIMESTAMP .
        docker tag safemap-dashboard:$TIMESTAMP safemap-dashboard:latest
    else
        log_verbose "DRY RUN: Would build dashboard Docker image"
    fi
    
    # Build mobile app
    log_info "Building mobile app..."
    cd "$PROJECT_ROOT/mobile"
    if [ "$DRY_RUN" = false ]; then
        flutter build apk --release
        if [ "$ENVIRONMENT" = "production" ]; then
            flutter build appbundle --release
        fi
    else
        log_verbose "DRY RUN: Would build mobile app"
    fi
    
    cd "$PROJECT_ROOT"
    log_success "All applications built successfully"
}

push_docker_images() {
    log_info "Pushing Docker images to registry..."
    
    # Configure AWS ECR
    if [ "$DRY_RUN" = false ]; then
        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
    else
        log_verbose "DRY RUN: Would login to ECR"
    fi
    
    # Push backend image
    local backend_image="$ECR_REGISTRY/safemap-backend:$TIMESTAMP"
    if [ "$DRY_RUN" = false ]; then
        docker tag safemap-backend:$TIMESTAMP $backend_image
        docker push $backend_image
        log_success "Backend image pushed: $backend_image"
    else
        log_verbose "DRY RUN: Would push $backend_image"
    fi
    
    # Push dashboard image
    local dashboard_image="$ECR_REGISTRY/safemap-dashboard:$TIMESTAMP"
    if [ "$DRY_RUN" = false ]; then
        docker tag safemap-dashboard:$TIMESTAMP $dashboard_image
        docker push $dashboard_image
        log_success "Dashboard image pushed: $dashboard_image"
    else
        log_verbose "DRY RUN: Would push $dashboard_image"
    fi
}

deploy_to_kubernetes() {
    log_info "Deploying to Kubernetes cluster: $CLUSTER_NAME"
    
    # Update kubeconfig
    if [ "$DRY_RUN" = false ]; then
        aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME
    else
        log_verbose "DRY RUN: Would update kubeconfig for $CLUSTER_NAME"
    fi
    
    # Create namespace if it doesn't exist
    if [ "$DRY_RUN" = false ]; then
        kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    else
        log_verbose "DRY RUN: Would create namespace $NAMESPACE"
    fi
    
    # Deploy applications
    local k8s_dir="$PROJECT_ROOT/infrastructure/kubernetes"
    
    # Update image tags in deployment files
    sed -i.bak "s|{{TIMESTAMP}}|$TIMESTAMP|g" "$k8s_dir/backend-deployment.yaml"
    sed -i.bak "s|{{TIMESTAMP}}|$TIMESTAMP|g" "$k8s_dir/dashboard-deployment.yaml"
    
    # Apply Kubernetes manifests
    if [ "$DRY_RUN" = false ]; then
        kubectl apply -f "$k8s_dir/" -n $NAMESPACE
    else
        log_verbose "DRY RUN: Would apply Kubernetes manifests in $NAMESPACE"
    fi
    
    # Wait for deployments to be ready
    if [ "$DRY_RUN" = false ]; then
        log_info "Waiting for deployments to be ready..."
        kubectl wait --for=condition=available --timeout=300s deployment/safemap-backend -n $NAMESPACE
        kubectl wait --for=condition=available --timeout=300s deployment/safemap-dashboard -n $NAMESPACE
    else
        log_verbose "DRY RUN: Would wait for deployments to be ready"
    fi
    
    # Restore original deployment files
    mv "$k8s_dir/backend-deployment.yaml.bak" "$k8s_dir/backend-deployment.yaml"
    mv "$k8s_dir/dashboard-deployment.yaml.bak" "$k8s_dir/dashboard-deployment.yaml"
    
    log_success "Kubernetes deployment completed"
}

deploy_mobile_app() {
    log_info "Deploying mobile app..."
    
    cd "$PROJECT_ROOT/mobile"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Uploading to Google Play Store..."
        if [ "$DRY_RUN" = false ]; then
            # Upload to Google Play Store using fastlane or manual process
            log_warning "Google Play Store upload requires manual process"
            log_info "APK location: build/app/outputs/flutter-apk/app-release.apk"
            log_info "AAB location: build/app/outputs/bundle/release/app-release.aab"
        else
            log_verbose "DRY RUN: Would upload to Google Play Store"
        fi
    else
        log_info "Uploading to Firebase App Distribution..."
        if [ "$DRY_RUN" = false ]; then
            firebase appdistribution:distribute build/app/outputs/flutter-apk/app-release.apk \
                --app $FIREBASE_APP_ID \
                --groups "testers" \
                --release-notes "Staging build $TIMESTAMP"
        else
            log_verbose "DRY RUN: Would upload to Firebase App Distribution"
        fi
    fi
    
    cd "$PROJECT_ROOT"
    log_success "Mobile app deployment completed"
}

run_database_migrations() {
    log_info "Running database migrations..."
    
    if [ "$DRY_RUN" = false ]; then
        cd "$PROJECT_ROOT/backend"
        npm run db:migrate
        log_success "Database migrations completed"
    else
        log_verbose "DRY RUN: Would run database migrations"
    fi
}

health_check() {
    log_info "Performing health checks..."
    
    if [ "$DRY_RUN" = true ]; then
        log_verbose "DRY RUN: Would perform health checks"
        return 0
    fi
    
    # Get service endpoints
    local backend_url=$(kubectl get service safemap-backend -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    local dashboard_url=$(kubectl get service safemap-dashboard -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    
    # Health check backend
    log_info "Checking backend health..."
    local backend_health=$(curl -s "http://$backend_url/api/v1/health" | jq -r '.status')
    if [ "$backend_health" = "healthy" ]; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
        exit 1
    fi
    
    # Health check dashboard
    log_info "Checking dashboard health..."
    local dashboard_status=$(curl -s -o /dev/null -w "%{http_code}" "http://$dashboard_url/")
    if [ "$dashboard_status" = "200" ]; then
        log_success "Dashboard is healthy"
    else
        log_error "Dashboard health check failed"
        exit 1
    fi
    
    log_success "All health checks passed"
}

send_notifications() {
    log_info "Sending deployment notifications..."
    
    if [ "$DRY_RUN" = true ]; then
        log_verbose "DRY RUN: Would send notifications"
        return 0
    fi
    
    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local message="🚀 Safe Map $ENVIRONMENT deployment completed successfully at $TIMESTAMP"
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    # Email notification (using AWS SES)
    if [ -n "$NOTIFICATION_EMAIL" ]; then
        aws ses send-email \
            --region $AWS_REGION \
            --source "noreply@safemap.in" \
            --destination "ToAddresses=$NOTIFICATION_EMAIL" \
            --message "Subject={Data='Safe Map Deployment Success'},Body={Text={Data='Safe Map $ENVIRONMENT environment deployed successfully at $TIMESTAMP'}}"
    fi
    
    log_success "Notifications sent"
}

rollback_deployment() {
    log_error "Deployment failed. Rolling back..."
    
    if [ "$DRY_RUN" = true ]; then
        log_verbose "DRY RUN: Would perform rollback"
        return 0
    fi
    
    # Rollback Kubernetes deployments
    kubectl rollout undo deployment/safemap-backend -n $NAMESPACE
    kubectl rollout undo deployment/safemap-dashboard -n $NAMESPACE
    
    log_success "Rollback completed"
}

main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -s|--skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            -b|--skip-build)
                SKIP_BUILD=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                print_usage
                exit 0
                ;;
            staging|production)
                ENVIRONMENT=$1
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                print_usage
                exit 1
                ;;
        esac
    done
    
    # Validate environment
    if [ -z "$ENVIRONMENT" ]; then
        log_error "Environment must be specified"
        print_usage
        exit 1
    fi
    
    if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
        log_error "Environment must be 'staging' or 'production'"
        exit 1
    fi
    
    # Main deployment flow
    log_info "🚀 Starting Safe Map deployment to $ENVIRONMENT"
    log_info "Timestamp: $TIMESTAMP"
    
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN MODE - No actual changes will be made"
    fi
    
    # Trap to handle failures
    trap rollback_deployment ERR
    
    check_prerequisites
    load_environment_config
    run_tests
    build_applications
    push_docker_images
    run_database_migrations
    deploy_to_kubernetes
    deploy_mobile_app
    health_check
    send_notifications
    
    log_success "🎉 Safe Map deployment to $ENVIRONMENT completed successfully!"
    log_info "Deployment timestamp: $TIMESTAMP"
    
    # Show deployment info
    if [ "$DRY_RUN" = false ]; then
        echo ""
        echo "📊 Deployment Summary:"
        echo "======================"
        echo "Environment: $ENVIRONMENT"
        echo "Cluster: $CLUSTER_NAME"
        echo "Namespace: $NAMESPACE"
        echo "Backend Image: $ECR_REGISTRY/safemap-backend:$TIMESTAMP"
        echo "Dashboard Image: $ECR_REGISTRY/safemap-dashboard:$TIMESTAMP"
        echo ""
        echo "🔗 Endpoints:"
        kubectl get services -n $NAMESPACE
    fi
}

# Run main function
main "$@" 