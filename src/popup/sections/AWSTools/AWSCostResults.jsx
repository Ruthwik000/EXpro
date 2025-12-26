import React from 'react';

const AWSCostResults = ({ recommendations, costEstimates, onReset }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white">No recommendations available.</p>
        <button
          onClick={onReset}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Start Over
        </button>
      </div>
    );
  }

  const topRecommendations = recommendations.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">AWS Recommendations</h2>
        <button
          onClick={onReset}
          className="text-sm bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded-md"
        >
          Start Over
        </button>
      </div>

      <p className="text-gray-300 text-sm">
        Based on your requirements, here are the top recommended AWS services with cost estimates:
      </p>

      <div className="space-y-6">
        {topRecommendations.map((recommendation, index) => {
          const costData = costEstimates?.find(ce => ce.service === recommendation.service);

          return (
            <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-white flex items-center">
                  {recommendation.service}
                  <span className="ml-2 text-sm bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    {recommendation.score}%
                  </span>
                </h3>
                <div className="text-sm text-gray-400">{recommendation.category}</div>
              </div>

              <p className="text-gray-300 mb-3">{recommendation.description}</p>

              {costData && (
                <div className="bg-gray-800 rounded p-3 mb-3">
                  <h4 className="text-white font-medium mb-2">Cost Estimate</h4>

                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-gray-400 text-sm">Monthly:</p>
                      <p className="text-white">${costData.monthlyCost.min} - ${costData.monthlyCost.max}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Yearly:</p>
                      <p className="text-white">${costData.yearlyCost.min} - ${costData.yearlyCost.max}</p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm">Pricing model: {costData.pricingModel}</p>
                </div>
              )}

              <div className="mb-3">
                <h4 className="text-white font-medium mb-1">Why This Works</h4>
                <p className="text-gray-300 text-sm">{recommendation.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-medium mb-1">Pros</h4>
                  <ul className="text-gray-300 text-sm list-disc pl-4 space-y-1">
                    {recommendation.pros.slice(0, 3).map((pro, idx) => (
                      <li key={idx}>{pro}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-1">Cons</h4>
                  <ul className="text-gray-300 text-sm list-disc pl-4 space-y-1">
                    {recommendation.cons.slice(0, 3).map((con, idx) => (
                      <li key={idx}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {costData && costData.savingStrategies && (
                <div className="mt-3">
                  <h4 className="text-white font-medium mb-1">Cost Optimization Tips</h4>
                  <ul className="text-gray-300 text-sm list-disc pl-4 space-y-1">
                    {costData.savingStrategies.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-3">
        <button
          onClick={() => {
            // This would export recommendations as PDF or CSV
            alert("Export functionality would go here");
          }}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md"
        >
          Export Recommendations
        </button>
      </div>
    </div>
  );
};

export default AWSCostResults;
