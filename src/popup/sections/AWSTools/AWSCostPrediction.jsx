import React, { useState, useEffect } from "react";
import AWSCostResults from "./AWSCostResults";

const AWSCostPrediction = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    workloadType: "",
    scale: "",
    budget: "",
    trafficPattern: "",
    customization: "",
    performance: "",
    opsPreference: "",
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [costEstimates, setCostEstimates] = useState(null);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call to get recommendations
    setTimeout(() => {
      // This would be replaced with actual API call to get recommendations
      const results = getAWSRecommendations(formData);
      setRecommendations(results);

      // Generate cost estimates
      const estimates = generateCostEstimates(results);
      setCostEstimates(estimates);

      setLoading(false);
      setStep(2);
    }, 800);
  };

  const handleReset = () => {
    setStep(1);
    setRecommendations([]);
    setCostEstimates(null);
  };

  const getAWSRecommendations = (inputs) => {
    // Simplified version of the AWS recommendation engine
    // In the real implementation, this would import from the recommendationEngine.js

    const AWS_SERVICES = {
      EC2: {
        category: "Compute",
        description: "Virtual servers in the cloud",
        pricing: {
          base: "pay-as-you-go",
          estimatedCostRange: {
            small: { min: 30, max: 100 },
            medium: { min: 100, max: 300 },
            large: { min: 300, max: 1000 },
            enterprise: { min: 1000, max: 5000 },
          },
          savingStrategies: [
            "Reserved instances for 1-3 year commitments (up to 75% savings)",
            "Spot instances for non-critical workloads (up to 90% savings)",
            "Right-sizing instances based on CloudWatch metrics",
          ],
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
        pricing: {
          base: "pay-per-request",
          estimatedCostRange: {
            small: { min: 5, max: 20 },
            medium: { min: 20, max: 50 },
            large: { min: 50, max: 200 },
            enterprise: { min: 200, max: 1000 },
          },
          savingStrategies: [
            "Optimize code execution time and memory allocation",
            "Implement caching for frequent operations",
            "Use Provisioned Concurrency for predictable workloads",
          ],
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
        pricing: {
          base: "depends on launch type (EC2 or Fargate)",
          estimatedCostRange: {
            small: { min: 20, max: 80 },
            medium: { min: 80, max: 200 },
            large: { min: 200, max: 600 },
            enterprise: { min: 600, max: 2000 },
          },
          savingStrategies: [
            "EC2 launch type with Spot instances for cost optimization",
            "Fargate Spot for non-critical workloads",
            "Container right-sizing based on CloudWatch metrics",
          ],
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
    };

    // Calculate compatibility scores
    const services = Object.entries(AWS_SERVICES).map(
      ([serviceName, service]) => {
        // This is a simplistic scoring mechanism for demo purposes
        // In the real implementation, this would be more sophisticated
        const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-99%

        return {
          service: serviceName,
          category: service.category,
          description: service.description,
          score: score,
          pros: service.pros,
          cons: service.cons,
          pricing: service.pricing,
          reason: `Based on your ${inputs.workloadType} workload type and ${inputs.opsPreference} operational preference, ${serviceName} provides a good balance of control and manageability.`,
          tradeoffs: `While offering good performance and scalability, you'll need to weigh the operational overhead against the flexibility it provides.`,
          alternatives: ["Option 1", "Option 2", "Option 3"],
        };
      },
    );

    // Sort by score descending
    return services.sort((a, b) => b.score - a.score);
  };

  const generateCostEstimates = (recommendations) => {
    if (!recommendations || recommendations.length === 0) return null;

    const scale = formData.scale || "medium";

    return recommendations.map((rec) => {
      const pricingInfo = rec.pricing;
      const costRange = pricingInfo.estimatedCostRange[scale];

      return {
        service: rec.service,
        monthlyCost: {
          min: costRange.min,
          max: costRange.max,
        },
        yearlyCost: {
          min: costRange.min * 12,
          max: costRange.max * 12,
        },
        savingStrategies: pricingInfo.savingStrategies,
        pricingModel: pricingInfo.base,
      };
    });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      {step === 1 ? (
        <>
          <h2 className="text-xl font-semibold text-white mb-4">
            AWS Cost Prediction
          </h2>
          <p className="text-gray-300 mb-4">
            Configure your workload details to receive AWS service
            recommendations with cost predictions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm">
                Workload Type
                <select
                  value={formData.workloadType}
                  onChange={(e) =>
                    handleInputChange("workloadType", e.target.value)
                  }
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm px-3 py-2"
                  required
                >
                  <option value="">Select workload type</option>
                  <option value="webApp">Web Application</option>
                  <option value="api">API Service</option>
                  <option value="ml">Machine Learning</option>
                  <option value="data">Data Processing</option>
                  <option value="serverless">Serverless</option>
                  <option value="storage">Storage Solution</option>
                  <option value="streaming">Streaming / Real-time</option>
                </select>
              </label>

              <label className="block text-gray-300 text-sm">
                Scale
                <select
                  value={formData.scale}
                  onChange={(e) => handleInputChange("scale", e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm px-3 py-2"
                  required
                >
                  <option value="">Select scale</option>
                  <option value="small">Small (Development/Testing)</option>
                  <option value="medium">Medium (Production startup)</option>
                  <option value="large">Large (Growing business)</option>
                  <option value="enterprise">Enterprise (High scale)</option>
                </select>
              </label>

              <label className="block text-gray-300 text-sm">
                Budget Constraint
                <select
                  value={formData.budget}
                  onChange={(e) => handleInputChange("budget", e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm px-3 py-2"
                  required
                >
                  <option value="">Select budget constraint</option>
                  <option value="veryLow">Very Low (Minimum viable)</option>
                  <option value="low">Low (Cost-sensitive)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Performance priority)</option>
                </select>
              </label>

              <label className="block text-gray-300 text-sm">
                Traffic Pattern
                <select
                  value={formData.trafficPattern}
                  onChange={(e) =>
                    handleInputChange("trafficPattern", e.target.value)
                  }
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm px-3 py-2"
                  required
                >
                  <option value="">Select traffic pattern</option>
                  <option value="predictable">Predictable (Stable)</option>
                  <option value="variable">
                    Variable (Day/night patterns)
                  </option>
                  <option value="spiky">Spiky (Unpredictable peaks)</option>
                </select>
              </label>

              <label className="block text-gray-300 text-sm">
                Customization Needs
                <select
                  value={formData.customization}
                  onChange={(e) =>
                    handleInputChange("customization", e.target.value)
                  }
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm px-3 py-2"
                  required
                >
                  <option value="">Select customization needs</option>
                  <option value="low">Low (Managed services preferred)</option>
                  <option value="medium">Medium (Some customization)</option>
                  <option value="high">High (Full control needed)</option>
                </select>
              </label>

              <label className="block text-gray-300 text-sm">
                Performance Requirements
                <select
                  value={formData.performance}
                  onChange={(e) =>
                    handleInputChange("performance", e.target.value)
                  }
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm px-3 py-2"
                  required
                >
                  <option value="">Select performance requirements</option>
                  <option value="standard">Standard (General purpose)</option>
                  <option value="high">High (Compute optimized)</option>
                  <option value="lowLatency">Low Latency (Critical)</option>
                </select>
              </label>

              <label className="block text-gray-300 text-sm">
                Operations Preference
                <select
                  value={formData.opsPreference}
                  onChange={(e) =>
                    handleInputChange("opsPreference", e.target.value)
                  }
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm px-3 py-2"
                  required
                >
                  <option value="">Select operations preference</option>
                  <option value="fullyManaged">
                    Fully Managed (Minimal ops)
                  </option>
                  <option value="partial">Partial (Some management)</option>
                  <option value="fullControl">
                    Full Control (Your team manages)
                  </option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              {loading ? "Analyzing..." : "Get Recommendations"}
            </button>
          </form>
        </>
      ) : (
        <AWSCostResults
          recommendations={recommendations}
          costEstimates={costEstimates}
          onReset={handleReset}
        />
      )}
    </div>
  );
};

export default AWSCostPrediction;
