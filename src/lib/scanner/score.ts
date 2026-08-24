export function calculateCategoryScore(category: string, issues: any[] = []): number {
  const cat = category.toLowerCase();

  // If calculating overall CRO pillar, compute weighted average of the 5 CRO dimensions
  if (cat === 'cro') {
    const ux = calculateCategoryScore('ux', issues);
    const visual = calculateCategoryScore('visual', issues);
    const copywriting = calculateCategoryScore('copywriting', issues);
    const trust = calculateCategoryScore('trust', issues);
    const cta = calculateCategoryScore('cta', issues);
    return Math.round(ux * 0.25 + visual * 0.20 + copywriting * 0.20 + trust * 0.20 + cta * 0.15);
  }

  const categoryIssues = (issues || []).filter(i => (i.category || '').toLowerCase() === cat);
  
  if (categoryIssues.length === 0) {
    return 100;
  }

  let penalty = 0;
  for (const issue of categoryIssues) {
    const priority = (issue.priority || issue.severity || 'medium').toLowerCase();
    if (priority === 'critical') penalty += 8;
    else if (priority === 'high') penalty += 5;
    else if (priority === 'medium') penalty += 3;
    else penalty += 1.5;
  }

  // Diminishing penalty curve so authentic scores range from 20 to 100
  const finalScore = Math.max(20, Math.min(100, Math.round(100 - penalty)));
  return finalScore;
}

export function calculateAllScores(scan: any): Record<string, number> {
  const rawScores = (scan?.scores as Record<string, any>) || { 
    seo: 90, 
    performance: 80, 
    accessibility: 85, 
    'best-practices': 90 
  };

  const techScores = Object.fromEntries(
    Object.entries(rawScores).filter(([_, v]) => typeof v === 'number')
  );
  
  const aiCategories = ['ux', 'visual', 'copywriting', 'trust', 'cta', 'cro'];
  const aiScores = aiCategories.reduce((acc, cat) => {
    acc[cat] = calculateCategoryScore(cat, scan?.issues || []);
    return acc;
  }, {} as Record<string, number>);

  return { ...techScores, ...aiScores };
}

export function calculateOverallScore(scan: any): number {
  const allScores = calculateAllScores(scan);
  
  // Calculate Technical Average
  const techKeys = ['seo', 'performance', 'accessibility', 'best-practices'];
  const techValues = techKeys.map(k => typeof allScores[k] === 'number' ? allScores[k] : null).filter((v): v is number => v !== null);
  const techAvg = techValues.length > 0 ? techValues.reduce((a, b) => a + b, 0) / techValues.length : 80;

  // Calculate CRO Average
  const croScore = allScores['cro'] || 75;

  // Final Overall Score: 40% Technical, 60% Conversion Experience
  const overall = Math.round(techAvg * 0.4 + croScore * 0.6);
  return Math.max(10, Math.min(100, overall));
}
