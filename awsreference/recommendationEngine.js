/**
 * AWS Recommender Extension - Recommendation Engine
 * Implements the core recommendation logic for AWS services based on user inputs
 */

// AWS service definitions with compatibility scoring profiles
const AWS_SERVICES = {
  // Compute services
  EC2: {
    category: "Compute",
    description: "Virtual servers in the cloud",
    compatibilityScores: {
      workloadType: {
        webApp: 80,
        api: 75,
        ml: 70,
        data: 80,
        serverless: 20,
        storage: 40,
        streaming: 60,
      },
      scale: {
        small: 50,
        medium: 80,
        large: 90,
        enterprise: 95,
      },
      budget: {
        veryLow: 30,
        low: 60,
        medium: 80,
        high: 90,
      },
      trafficPattern: {
        predictable: 90,
        variable: 70,
        spiky: 50,
      },
      customization: {
        low: 50,
        medium: 80,
        high: 95,
      },
      performance: {
        standard: 80,
        high: 85,
        lowLatency: 90,
      },
      opsPreference: {
        fullyManaged: 30,
        partial: 70,
        fullControl: 95,
      },
    },
    pros: [
      "Maximum flexibility and control",
      "Wide range of instance types",
      "Supports almost any workload",
      "Can be cost-effective for steady workloads",
    ],
    cons: [
      "Requires significant operational overhead",
      "Need to manage scaling manually or with Auto Scaling",
      "Capacity planning required",
      "Pay for provisioned capacity even when idle",
    ],
  },

  Lambda: {
    category: "Compute",
    description: "Run code without thinking about servers",
    compatibilityScores: {
      workloadType: {
        webApp: 70,
        api: 90,
        ml: 60,
        data: 75,
        serverless: 100,
        storage: 50,
        streaming: 80,
      },
      scale: {
        small: 95,
        medium: 90,
        large: 80,
        enterprise: 70,
      },
      budget: {
        veryLow: 95,
        low: 90,
        medium: 80,
        high: 70,
      },
      trafficPattern: {
        predictable: 80,
        variable: 90,
        spiky: 95,
      },
      customization: {
        low: 90,
        medium: 80,
        high: 50,
      },
      performance: {
        standard: 85,
        high: 70,
        lowLatency: 40,
      },
      opsPreference: {
        fullyManaged: 95,
        partial: 70,
        fullControl: 30,
      },
    },
    pros: [
      "Zero server management",
      "Pay only for what you use (per-request)",
      "Automatic scaling",
      "Built-in fault tolerance",
      "Wide range of triggers and integrations",
    ],
    cons: [
      "15-minute maximum execution time",
      "Cold start latency for infrequent requests",
      "Limited customization of runtime environment",
      "Memory limit of 10GB",
      "Not ideal for long-running processes",
    ],
  },

  ECS: {
    category: "Compute",
    description: "Run and manage Docker containers",
    compatibilityScores: {
      workloadType: {
        webApp: 85,
        api: 90,
        ml: 80,
        data: 85,
        serverless: 60,
        storage: 50,
        streaming: 75,
      },
      scale: {
        small: 70,
        medium: 85,
        large: 90,
        enterprise: 85,
      },
      budget: {
        veryLow: 50,
        low: 70,
        medium: 85,
        high: 90,
      },
      trafficPattern: {
        predictable: 85,
        variable: 80,
        spiky: 75,
      },
      customization: {
        low: 70,
        medium: 90,
        high: 85,
      },
      performance: {
        standard: 85,
        high: 80,
        lowLatency: 70,
      },
      opsPreference: {
        fullyManaged: 80,
        partial: 90,
        fullControl: 70,
      },
    },
    pros: [
      "Container orchestration without managing Kubernetes",
      "Choice of Fargate (serverless) or EC2 launch types",
      "Integration with other AWS services",
      "Supports Docker Compose and ECS CLI",
      "Task definitions for consistent deployments",
    ],
    cons: [
      "AWS-specific constructs to learn",
      "Not as flexible as Kubernetes for complex orchestration",
      "Requires more setup than fully managed services",
      "More operational overhead than serverless options",
    ],
  },

  EKS: {
    category: "Compute",
    description: "Managed Kubernetes service",
    compatibilityScores: {
      workloadType: {
        webApp: 80,
        api: 85,
        ml: 85,
        data: 90,
        serverless: 60,
        storage: 60,
        streaming: 80,
      },
      scale: {
        small: 50,
        medium: 75,
        large: 90,
        enterprise: 95,
      },
      budget: {
        veryLow: 30,
        low: 50,
        medium: 70,
        high: 90,
      },
      trafficPattern: {
        predictable: 80,
        variable: 85,
        spiky: 80,
      },
      customization: {
        low: 50,
        medium: 80,
        high: 95,
      },
      performance: {
        standard: 80,
        high: 85,
        lowLatency: 80,
      },
      opsPreference: {
        fullyManaged: 60,
        partial: 80,
        fullControl: 90,
      },
    },
    pros: [
      "Industry-standard Kubernetes orchestration",
      "Portability of configurations",
      "Advanced networking and scheduling",
      "Support for hybrid deployments",
      "Large ecosystem of tools and extensions",
    ],
    cons: [
      "Complex to set up and manage",
      "Steeper learning curve than ECS",
      "Higher operational overhead",
      "More expensive at smaller scale",
      "Requires Kubernetes expertise",
    ],
  },

  "Elastic Beanstalk": {
    category: "Compute",
    description: "Platform as a service for web applications",
    compatibilityScores: {
      workloadType: {
        webApp: 95,
        api: 85,
        ml: 50,
        data: 60,
        serverless: 40,
        storage: 30,
        streaming: 40,
      },
      scale: {
        small: 90,
        medium: 85,
        large: 75,
        enterprise: 60,
      },
      budget: {
        veryLow: 70,
        low: 80,
        medium: 85,
        high: 70,
      },
      trafficPattern: {
        predictable: 85,
        variable: 75,
        spiky: 65,
      },
      customization: {
        low: 90,
        medium: 80,
        high: 60,
      },
      performance: {
        standard: 85,
        high: 75,
        lowLatency: 60,
      },
      opsPreference: {
        fullyManaged: 90,
        partial: 80,
        fullControl: 50,
      },
    },
    pros: [
      "Simple deployment of web applications",
      "Supports multiple languages and platforms",
      "Managed platform updates and patches",
      "Auto-scaling and load balancing built in",
      "Developer-focused workflow",
    ],
    cons: [
      "Less flexible than container-based solutions",
      "Limited to specific application types",
      "Some platform restrictions",
      "Not ideal for microservices architectures",
      "Less control over infrastructure",
    ],
  },

  // Storage services
  S3: {
    category: "Storage",
    description: "Object storage service",
    compatibilityScores: {
      workloadType: {
        webApp: 80,
        api: 70,
        ml: 75,
        data: 90,
        serverless: 85,
        storage: 100,
        streaming: 70,
      },
      scale: {
        small: 90,
        medium: 90,
        large: 90,
        enterprise: 90,
      },
      budget: {
        veryLow: 85,
        low: 90,
        medium: 90,
        high: 90,
      },
      trafficPattern: {
        predictable: 90,
        variable: 90,
        spiky: 90,
      },
      customization: {
        low: 90,
        medium: 85,
        high: 75,
      },
      performance: {
        standard: 85,
        high: 80,
        lowLatency: 60,
      },
      opsPreference: {
        fullyManaged: 95,
        partial: 85,
        fullControl: 70,
      },
    },
    pros: [
      "Virtually unlimited scalability",
      "99.999999999% durability",
      "Cost-effective for any scale",
      "Multiple storage classes for cost optimization",
      "Native static website hosting",
    ],
    cons: [
      "Not suitable for file system access patterns",
      "Cannot be used as a boot volume",
      "Not suitable for frequently changing data",
      "Eventual consistency for some operations",
    ],
  },

  EFS: {
    category: "Storage",
    description: "Fully managed elastic NFS file system",
    compatibilityScores: {
      workloadType: {
        webApp: 75,
        api: 60,
        ml: 80,
        data: 85,
        serverless: 70,
        storage: 95,
        streaming: 60,
      },
      scale: {
        small: 70,
        medium: 85,
        large: 90,
        enterprise: 90,
      },
      budget: {
        veryLow: 60,
        low: 70,
        medium: 85,
        high: 90,
      },
      trafficPattern: {
        predictable: 85,
        variable: 80,
        spiky: 75,
      },
      customization: {
        low: 85,
        medium: 80,
        high: 70,
      },
      performance: {
        standard: 80,
        high: 75,
        lowLatency: 65,
      },
      opsPreference: {
        fullyManaged: 90,
        partial: 80,
        fullControl: 60,
      },
    },
    pros: [
      "Fully managed shared file system",
      "Elastically scales to petabytes",
      "Multiple access modes (regional)",
      "Pay for what you use without provisioning",
      "Supports thousands of concurrent connections",
    ],
    cons: [
      "Higher latency than EBS",
      "More expensive than S3 for large datasets",
      "Regional access (not global like S3)",
      "Performance scales with size",
    ],
  },

  EBS: {
    category: "Storage",
    description: "Block storage volumes for EC2 instances",
    compatibilityScores: {
      workloadType: {
        webApp: 75,
        api: 70,
        ml: 75,
        data: 80,
        serverless: 30,
        storage: 90,
        streaming: 60,
      },
      scale: {
        small: 80,
        medium: 85,
        large: 85,
        enterprise: 85,
      },
      budget: {
        veryLow: 60,
        low: 70,
        medium: 80,
        high: 85,
      },
      trafficPattern: {
        predictable: 85,
        variable: 75,
        spiky: 70,
      },
      customization: {
        low: 80,
        medium: 85,
        high: 85,
      },
      performance: {
        standard: 80,
        high: 85,
        lowLatency: 90,
      },
      opsPreference: {
        fullyManaged: 70,
        partial: 85,
        fullControl: 90,
      },
    },
    pros: [
      "Low-latency block storage",
      "Multiple volume types for different workloads",
      "Independent lifecycle from EC2 instances",
      "Point-in-time snapshots",
      "High IOPS options available",
    ],
    cons: [
      "Must be attached to EC2 instances",
      "Limited to single AZ (except io2 Block Express)",
      "Need to provision capacity in advance",
      "Not shareable between instances (except with multi-attach)",
    ],
  },

  // Database services
  RDS: {
    category: "Database",
    description: "Managed relational database service",
    compatibilityScores: {
      workloadType: {
        webApp: 90,
        api: 85,
        ml: 70,
        data: 85,
        serverless: 70,
        storage: 75,
        streaming: 60,
      },
      scale: {
        small: 85,
        medium: 90,
        large: 80,
        enterprise: 75,
      },
      budget: {
        veryLow: 60,
        low: 75,
        medium: 85,
        high: 90,
      },
      trafficPattern: {
        predictable: 90,
        variable: 80,
        spiky: 65,
      },
      customization: {
        low: 90,
        medium: 85,
        high: 70,
      },
      performance: {
        standard: 85,
        high: 80,
        lowLatency: 75,
      },
      opsPreference: {
        fullyManaged: 90,
        partial: 80,
        fullControl: 60,
      },
    },
    pros: [
      "Managed database with automated backups",
      "Multi-AZ deployments for high availability",
      "Supports multiple DB engines (MySQL, PostgreSQL, Oracle, SQL Server)",
      "Automated patching and maintenance",
      "Read replicas for scaling read-heavy workloads",
    ],
    cons: [
      "Higher cost than self-managed databases",
      "Some limitations on admin access",
      "Maintenance windows can disrupt service",
      "Limited customization of DB parameters",
      "Fixed scaling increments",
    ],
  },

  DynamoDB: {
    category: "Database",
    description: "Managed NoSQL database service",
    compatibilityScores: {
      workloadType: {
        webApp: 80,
        api: 90,
        ml: 70,
        data: 85,
        serverless: 95,
        storage: 80,
        streaming: 85,
      },
      scale: {
        small: 90,
        medium: 90,
        large: 95,
        enterprise: 95,
      },
      budget: {
        veryLow: 75,
        low: 85,
        medium: 90,
        high: 90,
      },
      trafficPattern: {
        predictable: 85,
        variable: 90,
        spiky: 95,
      },
      customization: {
        low: 90,
        medium: 80,
        high: 60,
      },
      performance: {
        standard: 90,
        high: 95,
        lowLatency: 95,
      },
      opsPreference: {
        fullyManaged: 95,
        partial: 80,
        fullControl: 50,
      },
    },
    pros: [
      "Fully managed NoSQL database",
      "Single-digit millisecond latency",
      "Virtually unlimited throughput and storage",
      "Auto-scaling capabilities",
      "Global tables for multi-region deployment",
      "Pay for what you use with on-demand capacity",
    ],
    cons: [
      "Limited query patterns (key-value and limited indexes)",
      "Not suitable for complex joins or transactions",
      "Data modeling requires different approach than SQL",
      "Provisioned capacity needs monitoring",
      "Less flexible than traditional databases for complex queries",
    ],
  },

  Aurora: {
    category: "Database",
    description: "MySQL and PostgreSQL compatible relational database",
    compatibilityScores: {
      workloadType: {
        webApp: 90,
        api: 85,
        ml: 70,
        data: 90,
        serverless: 75,
        storage: 75,
        streaming: 65,
      },
      scale: {
        small: 70,
        medium: 85,
        large: 95,
        enterprise: 95,
      },
      budget: {
        veryLow: 50,
        low: 65,
        medium: 85,
        high: 95,
      },
      trafficPattern: {
        predictable: 85,
        variable: 85,
        spiky: 80,
      },
      customization: {
        low: 85,
        medium: 85,
        high: 80,
      },
      performance: {
        standard: 90,
        high: 95,
        lowLatency: 90,
      },
      opsPreference: {
        fullyManaged: 90,
        partial: 80,
        fullControl: 65,
      },
    },
    pros: [
      "3-5x performance improvement over standard MySQL/PostgreSQL",
      "Distributed, fault-tolerant, self-healing storage",
      "Auto-scaling storage up to 128TB",
      "Up to 15 read replicas with sub-10ms replication",
      "Serverless option for variable workloads",
    ],
    cons: [
      "More expensive than standard RDS",
      "Some compatibility differences from MySQL/PostgreSQL",
      "Limited to MySQL and PostgreSQL compatibility",
      "Regional service (global database requires setup)",
      "Aurora Serverless has limitations with connections",
    ],
  },

  // Networking services
  "API Gateway": {
    category: "Networking",
    description: "Create, publish, maintain, and secure APIs",
    compatibilityScores: {
      workloadType: {
        webApp: 75,
        api: 100,
        ml: 70,
        data: 70,
        serverless: 95,
        storage: 60,
        streaming: 75,
      },
      scale: {
        small: 90,
        medium: 90,
        large: 90,
        enterprise: 85,
      },
      budget: {
        veryLow: 70,
        low: 80,
        medium: 85,
        high: 90,
      },
      trafficPattern: {
        predictable: 85,
        variable: 90,
        spiky: 90,
      },
      customization: {
        low: 90,
        medium: 85,
        high: 75,
      },
      performance: {
        standard: 85,
        high: 85,
        lowLatency: 80,
      },
      opsPreference: {
        fullyManaged: 95,
        partial: 80,
        fullControl: 60,
      },
    },
    pros: [
      "Fully managed API management service",
      "Request validation and transformation",
      "API keys, rate limiting, and throttling",
      "CloudWatch monitoring integration",
      "Automatic SDK generation",
      "WebSocket support",
    ],
    cons: [
      "Can be expensive at high volumes",
      "Gateway execution timeout limitations",
      "More complex configuration for advanced use cases",
      "Cold start latency when traffic spikes",
      "Limited to HTTP/HTTPS protocols",
    ],
  },

  ALB: {
    category: "Networking",
    description: "Application Load Balancer",
    compatibilityScores: {
      workloadType: {
        webApp: 95,
        api: 90,
        ml: 70,
        data: 70,
        serverless: 70,
        storage: 50,
        streaming: 70,
      },
      scale: {
        small: 75,
        medium: 90,
        large: 95,
        enterprise: 95,
      },
      budget: {
        veryLow: 60,
        low: 75,
        medium: 85,
        high: 90,
      },
      trafficPattern: {
        predictable: 90,
        variable: 90,
        spiky: 85,
      },
      customization: {
        low: 90,
        medium: 85,
        high: 75,
      },
      performance: {
        standard: 90,
        high: 85,
        lowLatency: 80,
      },
      opsPreference: {
        fullyManaged: 90,
        partial: 85,
        fullControl: 70,
      },
    },
    pros: [
      "Layer 7 (HTTP/HTTPS) load balancing",
      "Path-based routing",
      "Host-based routing",
      "Support for WebSockets and HTTP/2",
      "Integration with AWS Certificate Manager",
      "Target groups for flexible backend registration",
    ],
    cons: [
      "Higher cost than simple DNS round-robin",
      "Not suitable for non-HTTP protocols (use NLB instead)",
      "Requires proper subnet configuration",
      "Configuration complexity for advanced routing",
    ],
  },

  CloudFront: {
    category: "Networking",
    description: "Global content delivery network (CDN)",
    compatibilityScores: {
      workloadType: {
        webApp: 95,
        api: 85,
        ml: 60,
        data: 70,
        serverless: 80,
        storage: 80,
        streaming: 90,
      },
      scale: {
        small: 80,
        medium: 85,
        large: 90,
        enterprise: 95,
      },
      budget: {
        veryLow: 65,
        low: 75,
        medium: 85,
        high: 90,
      },
      trafficPattern: {
        predictable: 85,
        variable: 90,
        spiky: 95,
      },
      customization: {
        low: 90,
        medium: 85,
        high: 75,
      },
      performance: {
        standard: 90,
        high: 95,
        lowLatency: 95,
      },
      opsPreference: {
        fullyManaged: 95,
        partial: 80,
        fullControl: 70,
      },
    },
    pros: [
      "Global edge network for low latency",
      "Integrates with AWS Certificate Manager for SSL",
      "DDoS protection and AWS Shield integration",
      "Edge computing via Lambda@Edge",
      "Real-time metrics and logging",
      "Support for static and dynamic content",
    ],
    cons: [
      "Additional cost over direct S3/ALB access",
      "Cache invalidation can take time to propagate",
      "Complex pricing model",
      "Configuration complexity for advanced scenarios",
    ],
  },

  // Streaming/Messaging services
  SQS: {
    category: "Messaging",
    description: "Fully managed message queuing service",
    compatibilityScores: {
      workloadType: {
        webApp: 70,
        api: 80,
        ml: 75,
        data: 85,
        serverless: 90,
        storage: 60,
        streaming: 90,
      },
      scale: {
        small: 85,
        medium: 90,
        large: 90,
        enterprise: 90,
      },
      budget: {
        veryLow: 85,
        low: 90,
        medium: 90,
        high: 90,
      },
      trafficPattern: {
        predictable: 85,
        variable: 90,
        spiky: 95,
      },
      customization: {
        low: 90,
        medium: 85,
        high: 70,
      },
      performance: {
        standard: 85,
        high: 80,
        lowLatency: 70,
      },
      opsPreference: {
        fullyManaged: 95,
        partial: 80,
        fullControl: 60,
      },
    },
    pros: [
      "Fully managed message queue",
      "Virtually unlimited throughput",
      "At-least-once message delivery",
      "FIFO queues available",
      "Message retention up to 14 days",
      "Batching support for higher throughput",
    ],
    cons: [
      "Not designed for pub/sub pattern (use SNS)",
      "Message size limited to 256KB",
      "No automatic fanout to multiple consumers",
      "Exactly-once processing requires additional logic",
      "FIFO queues have throughput limitations",
    ],
  },

  SNS: {
    category: "Messaging",
    description: "Fully managed pub/sub messaging service",
    compatibilityScores: {
      workloadType: {
        webApp: 75,
        api: 85,
        ml: 70,
        data: 80,
        serverless: 90,
        storage: 60,
        streaming: 95,
      },
      scale: {
        small: 85,
        medium: 90,
        large: 90,
        enterprise: 90,
      },
      budget: {
        veryLow: 85,
        low: 90,
        medium: 90,
        high: 90,
      },
      trafficPattern: {
        predictable: 85,
        variable: 90,
        spiky: 95,
      },
      customization: {
        low: 90,
        medium: 85,
        high: 70,
      },
      performance: {
        standard: 90,
        high: 85,
        lowLatency: 80,
      },
      opsPreference: {
        fullyManaged: 95,
        partial: 80,
        fullControl: 60,
      },
    },
    pros: [
      "Pub/sub messaging with multiple subscribers",
      "Fan-out to multiple endpoints",
      "Support for Lambda, SQS, HTTP, email, SMS",
      "FIFO support for ordered delivery",
      "Message filtering capabilities",
      "Cross-region delivery",
    ],
    cons: [
      "No message persistence (use with SQS for durability)",
      "Message size limited to 256KB",
      "Best-effort ordering (except FIFO)",
      "No dead-letter queue support (must use with SQS)",
      "Mobile push notification requires setup",
    ],
  },

  Kinesis: {
    category: "Streaming",
    description: "Process and analyze real-time streaming data",
    compatibilityScores: {
      workloadType: {
        webApp: 60,
        api: 70,
        ml: 85,
        data: 90,
        serverless: 80,
        storage: 70,
        streaming: 100,
      },
      scale: {
        small: 60,
        medium: 80,
        large: 95,
        enterprise: 95,
      },
      budget: {
        veryLow: 50,
        low: 70,
        medium: 85,
        high: 95,
      },
      trafficPattern: {
        predictable: 80,
        variable: 90,
        spiky: 90,
      },
      customization: {
        low: 80,
        medium: 85,
        high: 90,
      },
      performance: {
        standard: 85,
        high: 90,
        lowLatency: 90,
      },
      opsPreference: {
        fullyManaged: 85,
        partial: 90,
        fullControl: 75,
      },
    },
    pros: [
      "Real-time processing of streaming data",
      "Durable storage of stream data",
      "Multiple consumers of the same stream",
      "Integrates with Lambda, Firehose, Analytics",
      "Ordered record delivery within shards",
      "Data retention up to 365 days",
    ],
    cons: [
      "Requires shard management",
      "More complex setup than simple messaging",
      "Provisioned capacity model (need to manage shard count)",
      "More expensive than batch processing for high volumes",
      "Resharding operations can be complex",
    ],
  },

  // ML services
  SageMaker: {
    category: "Machine Learning",
    description: "Build, train, and deploy ML models",
    compatibilityScores: {
      workloadType: {
        webApp: 50,
        api: 70,
        ml: 100,
        data: 80,
        serverless: 70,
        storage: 50,
        streaming: 75,
      },
      scale: {
        small: 70,
        medium: 80,
        large: 90,
        enterprise: 95,
      },
      budget: {
        veryLow: 40,
        low: 60,
        medium: 80,
        high: 95,
      },
      trafficPattern: {
        predictable: 85,
        variable: 80,
        spiky: 75,
      },
      customization: {
        low: 80,
        medium: 90,
        high: 95,
      },
      performance: {
        standard: 85,
        high: 90,
        lowLatency: 80,
      },
      opsPreference: {
        fullyManaged: 90,
        partial: 85,
        fullControl: 80,
      },
    },
    pros: [
      "End-to-end ML workflow support",
      "Built-in algorithms and support for custom models",
      "Managed Jupyter notebooks",
      "Automated model tuning",
      "Distributed training capabilities",
      "Model monitoring and versioning",
    ],
    cons: [
      "Relatively high cost for long-running instances",
      "Learning curve for effective use",
      "Some configuration complexity",
      "Less cost-effective for small-scale ML",
      "Requires ML expertise for best results",
    ],
  },
};

/**
 * Get AWS service recommendations based on user inputs
 * @param {Object} inputs - User inputs from the form
 * @returns {Array} - Array of recommendation objects sorted by score
 */
function getAWSRecommendations(inputs) {
  const recommendations = [];
  const weights = Utils.WEIGHTS;

  // Calculate max possible score for normalization
  const maxPossible =
    weights.WORKLOAD_TYPE * 100 +
    weights.SCALE * 100 +
    weights.BUDGET * 100 +
    weights.TRAFFIC_PATTERN * 100 +
    weights.CUSTOMIZATION * 100 +
    weights.PERFORMANCE * 100 +
    weights.OPS_PREFERENCE * 100;

  // Process each AWS service
  for (const [serviceName, serviceData] of Object.entries(AWS_SERVICES)) {
    const scores = serviceData.compatibilityScores;
    let totalScore = 0;
    let reasonDetails = [];
    let tradeoffs = [];

    // Calculate workload type score
    const workloadScore = scores.workloadType[inputs.workloadType] || 50;
    totalScore += workloadScore * weights.WORKLOAD_TYPE;
    if (workloadScore >= 85) {
      reasonDetails.push(
        `Highly suitable for ${inputs.workloadType} workloads`,
      );
    } else if (workloadScore <= 40) {
      tradeoffs.push(`Not ideal for ${inputs.workloadType} workloads`);
    }

    // Calculate scale score
    const scaleValue = Utils.mapScaleToValue(inputs.scale);
    const scaleLabels = {
      1: "small",
      2: "medium",
      3: "large",
      4: "enterprise",
    };
    const scaleScore = scores.scale[inputs.scale] || 50;
    totalScore += scaleScore * weights.SCALE;
    if (scaleScore >= 85) {
      reasonDetails.push(`Works well at ${inputs.scale} scale`);
    } else if (scaleScore <= 60) {
      tradeoffs.push(`May struggle with ${inputs.scale} scale workloads`);
    }

    // Calculate budget score
    const budgetScore = scores.budget[inputs.budget] || 50;
    totalScore += budgetScore * weights.BUDGET;
    if (budgetScore >= 85) {
      reasonDetails.push(`Cost-effective for ${inputs.budget} budgets`);
    } else if (budgetScore <= 60) {
      tradeoffs.push(`Can be expensive for ${inputs.budget} budgets`);
    }

    // Calculate traffic pattern score
    const trafficScore = scores.trafficPattern[inputs.trafficPattern] || 50;
    totalScore += trafficScore * weights.TRAFFIC_PATTERN;
    if (trafficScore >= 85) {
      reasonDetails.push(
        `Handles ${inputs.trafficPattern} traffic patterns well`,
      );
    } else if (trafficScore <= 60) {
      tradeoffs.push(
        `Not optimal for ${inputs.trafficPattern} traffic patterns`,
      );
    }

    // Calculate customization score
    const customizationScore = scores.customization[inputs.customization] || 50;
    totalScore += customizationScore * weights.CUSTOMIZATION;
    if (customizationScore >= 85) {
      reasonDetails.push(
        `Supports ${inputs.customization} customization needs`,
      );
    } else if (customizationScore <= 60) {
      tradeoffs.push(
        `Limited customization for ${inputs.customization} requirements`,
      );
    }

    // Calculate performance score
    const performanceScore = scores.performance[inputs.performance] || 50;
    totalScore += performanceScore * weights.PERFORMANCE;
    if (performanceScore >= 85) {
      reasonDetails.push(
        `Meets ${inputs.performance} performance requirements`,
      );
    } else if (performanceScore <= 60) {
      tradeoffs.push(`May not meet ${inputs.performance} performance needs`);
    }

    // Calculate ops preference score
    const opsScore = scores.opsPreference[inputs.opsPreference] || 50;
    totalScore += opsScore * weights.OPS_PREFERENCE;
    if (opsScore >= 85) {
      reasonDetails.push(
        `Matches your ${inputs.opsPreference} operations preference`,
      );
    } else if (opsScore <= 60) {
      tradeoffs.push(
        `Operations model doesn't align with ${inputs.opsPreference} preference`,
      );
    }

    // Calculate normalized score (0-100)
    const normalizedScore = Utils.normalizeScore(totalScore, maxPossible);

    // Find alternatives
    const alternatives = [];
    if (serviceName === "EC2") {
      alternatives.push("Elastic Beanstalk", "ECS", "EKS");
    } else if (serviceName === "Lambda") {
      alternatives.push("EC2", "ECS", "Elastic Beanstalk");
    } else if (serviceName === "ECS") {
      alternatives.push("EKS", "EC2", "Elastic Beanstalk");
    } else if (serviceName === "EKS") {
      alternatives.push("ECS", "EC2");
    } else if (serviceName === "Elastic Beanstalk") {
      alternatives.push("EC2", "ECS", "Lambda");
    } else if (serviceName === "S3") {
      alternatives.push("EFS", "EBS");
    } else if (serviceName === "EFS") {
      alternatives.push("S3", "EBS");
    } else if (serviceName === "EBS") {
      alternatives.push("EFS", "S3");
    } else if (serviceName === "RDS") {
      alternatives.push("Aurora", "DynamoDB");
    } else if (serviceName === "DynamoDB") {
      alternatives.push("RDS", "Aurora");
    } else if (serviceName === "Aurora") {
      alternatives.push("RDS", "DynamoDB");
    } else if (serviceName === "API Gateway") {
      alternatives.push("ALB", "CloudFront");
    } else if (serviceName === "ALB") {
      alternatives.push("API Gateway", "CloudFront");
    } else if (serviceName === "CloudFront") {
      alternatives.push("ALB", "API Gateway");
    } else if (serviceName === "SQS") {
      alternatives.push("SNS", "Kinesis");
    } else if (serviceName === "SNS") {
      alternatives.push("SQS", "Kinesis");
    } else if (serviceName === "Kinesis") {
      alternatives.push("SQS", "SNS");
    } else if (serviceName === "SageMaker") {
      alternatives.push(
        "EC2 with custom ML frameworks",
        "Lambda for inference",
      );
    }

    // Add recommendation
    recommendations.push({
      service: serviceName,
      category: serviceData.category,
      description: serviceData.description,
      score: normalizedScore,
      reason: reasonDetails.join(". "),
      tradeoffs:
        tradeoffs.length > 0
          ? tradeoffs.join(". ")
          : "No significant tradeoffs for your requirements.",
      alternatives: alternatives,
      pros: serviceData.pros,
      cons: serviceData.cons,
    });
  }

  // Sort recommendations by score (descending)
  return recommendations.sort((a, b) => b.score - a.score);
}

// Export recommendation function
window.RecommendationEngine = {
  getAWSRecommendations,
};
