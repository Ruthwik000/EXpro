/**
 * AWS Recommender Extension - Popup UI Script
 * Handles UI interactions, form submission, and rendering of recommendations
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI elements
  const form = document.getElementById('recommendationForm');
  const resultsDiv = document.getElementById('results');
  const recommendationsDiv = document.getElementById('recommendations');
  const exportButton = document.getElementById('exportButton');
  const newRecommendationButton = document.getElementById('newRecommendation');
  const loadingDiv = document.getElementById('loading');
  const darkModeToggle = document.getElementById('darkMode');

  // Initialize dark mode
  Utils.initDarkMode();

  // Handle form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Show loading indicator
    form.classList.add('hidden');
    loadingDiv.classList.remove('hidden');

    // Get user inputs
    const inputs = {
      workloadType: document.getElementById('workloadType').value,
      scale: document.getElementById('scale').value,
      budget: document.getElementById('budget').value,
      trafficPattern: document.getElementById('trafficPattern').value,
      customization: document.getElementById('customization').value,
      performance: document.getElementById('performance').value,
      opsPreference: document.getElementById('opsPreference').value
    };

    // Get recommendations (simulate delay to show loading indicator)
    setTimeout(function() {
      const recommendations = RecommendationEngine.getAWSRecommendations(inputs);

      // Save last recommendation
      Utils.saveLastRecommendation({
        inputs: inputs,
        recommendations: recommendations
      }).catch(err => console.error('Error saving recommendation', err));

      // Display recommendations
      renderRecommendations(recommendations);

      // Hide loading, show results
      loadingDiv.classList.add('hidden');
      resultsDiv.classList.remove('hidden');
    }, 800); // Simulate processing time
  });

  // Handle export button
  exportButton.addEventListener('click', function() {
    Utils.getLastRecommendation()
      .then(result => {
        if (result) {
          Utils.exportRecommendationAsJson(result);
        }
      })
      .catch(err => console.error('Error exporting recommendation', err));
  });

  // Handle new recommendation button
  newRecommendationButton.addEventListener('click', function() {
    resultsDiv.classList.add('hidden');
    form.classList.remove('hidden');
  });

  // Handle dark mode toggle
  darkModeToggle.addEventListener('change', function(e) {
    Utils.toggleDarkMode(e.target.checked);
  });

  // Check for last recommendation and offer to restore
  Utils.getLastRecommendation()
    .then(result => {
      if (result && result.timestamp) {
        // Only show if less than 7 days old
        const lastDate = new Date(result.timestamp);
        const daysDiff = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));

        if (daysDiff < 7) {
          showLastRecommendationPrompt(lastDate);
        }
      }
    })
    .catch(err => console.error('Error checking for last recommendation', err));

  /**
   * Render recommendation cards in the UI
   * @param {Array} recommendations - Array of recommendation objects
   */
  function renderRecommendations(recommendations) {
    // Clear previous recommendations
    recommendationsDiv.innerHTML = '';

    // Get top 3 recommendations
    const topRecommendations = recommendations.slice(0, 3);

    // Create cards for top recommendations
    topRecommendations.forEach(rec => {
      const card = document.createElement('div');
      card.className = 'recommendation-card';

      // Header with service name and score
      const header = document.createElement('div');
      header.className = 'service-header';

      const serviceNameDiv = document.createElement('div');
      serviceNameDiv.className = 'service-name';
      serviceNameDiv.textContent = `${rec.service} (${rec.category})`;

      const scoreDiv = document.createElement('div');
      scoreDiv.className = 'score';
      scoreDiv.textContent = Utils.formatScore(rec.score);

      header.appendChild(serviceNameDiv);
      header.appendChild(scoreDiv);
      card.appendChild(header);

      // Description
      const descriptionDiv = document.createElement('div');
      descriptionDiv.className = 'description';
      descriptionDiv.textContent = rec.description;
      card.appendChild(descriptionDiv);

      // Reason
      const reasonDiv = document.createElement('div');
      reasonDiv.className = 'reason';

      const reasonTitle = document.createElement('div');
      reasonTitle.className = 'section-title';
      reasonTitle.textContent = 'Why it fits your use case:';

      const reasonText = document.createElement('div');
      reasonText.textContent = rec.reason;

      reasonDiv.appendChild(reasonTitle);
      reasonDiv.appendChild(reasonText);
      card.appendChild(reasonDiv);

      // Pros
      const prosDiv = document.createElement('div');
      prosDiv.className = 'pros';

      const prosTitle = document.createElement('div');
      prosTitle.className = 'section-title';
      prosTitle.textContent = 'Pros:';

      const prosList = document.createElement('ul');
      rec.pros.forEach(pro => {
        const item = document.createElement('li');
        item.textContent = pro;
        prosList.appendChild(item);
      });

      prosDiv.appendChild(prosTitle);
      prosDiv.appendChild(prosList);
      card.appendChild(prosDiv);

      // Tradeoffs
      const tradeoffsDiv = document.createElement('div');
      tradeoffsDiv.className = 'tradeoffs';

      const tradeoffsTitle = document.createElement('div');
      tradeoffsTitle.className = 'section-title';
      tradeoffsTitle.textContent = 'Tradeoffs:';

      const tradeoffsText = document.createElement('div');
      tradeoffsText.textContent = rec.tradeoffs;

      tradeoffsDiv.appendChild(tradeoffsTitle);
      tradeoffsDiv.appendChild(tradeoffsText);
      card.appendChild(tradeoffsDiv);

      // Cons
      const consDiv = document.createElement('div');
      consDiv.className = 'cons';

      const consTitle = document.createElement('div');
      consTitle.className = 'section-title';
      consTitle.textContent = 'Cons:';

      const consList = document.createElement('ul');
      rec.cons.forEach(con => {
        const item = document.createElement('li');
        item.textContent = con;
        consList.appendChild(item);
      });

      consDiv.appendChild(consTitle);
      consDiv.appendChild(consList);
      card.appendChild(consDiv);

      // Alternatives
      const alternativesDiv = document.createElement('div');
      alternativesDiv.className = 'alternatives';

      const alternativesTitle = document.createElement('div');
      alternativesTitle.className = 'section-title';
      alternativesTitle.textContent = 'Alternatives to consider:';

      const alternativesText = document.createElement('div');
      alternativesText.textContent = rec.alternatives.join(', ');

      alternativesDiv.appendChild(alternativesTitle);
      alternativesDiv.appendChild(alternativesText);
      card.appendChild(alternativesDiv);

      // Add card to recommendations div
      recommendationsDiv.appendChild(card);
    });
  }

  /**
   * Show prompt to restore last recommendation
   * @param {Date} lastDate - Date of last recommendation
   */
  function showLastRecommendationPrompt(lastDate) {
    const promptDiv = document.createElement('div');
    promptDiv.className = 'last-recommendation-prompt';

    const promptText = document.createElement('p');
    promptText.textContent = `You have a saved recommendation from ${lastDate.toLocaleDateString()}. Would you like to view it?`;

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'prompt-buttons';

    const yesButton = document.createElement('button');
    yesButton.textContent = 'Yes, show me';
    yesButton.addEventListener('click', () => {
      Utils.getLastRecommendation()
        .then(result => {
          if (result) {
            renderRecommendations(result.data.recommendations);
            resultsDiv.classList.remove('hidden');
            form.classList.add('hidden');
            promptDiv.remove();
          }
        })
        .catch(err => console.error('Error restoring recommendation', err));
    });

    const noButton = document.createElement('button');
    noButton.textContent = 'No, start new';
    noButton.addEventListener('click', () => {
      promptDiv.remove();
    });

    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);
    promptDiv.appendChild(promptText);
    promptDiv.appendChild(buttonContainer);

    // Insert at the top of the form
    form.parentNode.insertBefore(promptDiv, form);
  }
});
