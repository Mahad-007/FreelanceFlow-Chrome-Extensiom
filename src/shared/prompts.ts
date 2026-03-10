import type { UserProfile, ScrapedJob, JobDetailData, ProfileData, ChatData, FetchedPortfolioData } from "./types";

export function buildScoreJobsPrompt(
  jobs: ScrapedJob[],
  profile: UserProfile
): string {
  const skillNames = profile.skills.map((s) => s.name);
  return `You are a freelance job matching expert. Score each job 0-100 based on how well it matches this freelancer profile. Also provide a brief reason for each score.

PROFILE:
- Name: ${profile.name}
- Title: ${profile.title}
- Skills: ${skillNames.join(", ")}
- Hourly Rate: $${profile.hourlyRateMin}-$${profile.hourlyRateMax}
- Experience: ${profile.experience}
- Categories: ${profile.categories.join(", ")}

JOBS:
${jobs.map((j, i) => `[${i}] ID: ${j.id}\nTitle: ${j.title}\nDescription: ${j.description.slice(0, 500)}\nSkills: ${j.skills.join(", ")}\nBudget: ${j.budget}`).join("\n\n")}

Return ONLY a JSON array of objects with "id", "score", and "reason" fields. Example: [{"id":"abc","score":85,"reason":"Strong skill match in React and TypeScript"}]
Use these IDs: ${jobs.map((j) => j.id).join(", ")}`;
}

export function buildProposalPrompt(
  job: JobDetailData | ScrapedJob,
  profile: UserProfile,
  portfolioContext?: string
): string {
  const skillNames = profile.skills.map((s) => s.name);
  const jobContext = [
    `Title: ${job.title}`,
    `Description: ${"fullDescription" in job ? job.fullDescription : job.description}`,
    `Skills required: ${job.skills.join(", ")}`,
    job.budget ? `Budget: ${job.budget}` : null,
    job.experienceLevel ? `Experience level: ${job.experienceLevel}` : null,
    job.clientCountry ? `Client country: ${job.clientCountry}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const profileContext = [
    `Name: ${profile.name}`,
    profile.title ? `Professional title: ${profile.title}` : null,
    profile.bio ? `Bio: ${profile.bio}` : null,
    `Skills: ${skillNames.join(", ")}`,
    `Hourly rate: $${profile.hourlyRateMin}-$${profile.hourlyRateMax}`,
    `Experience level: ${profile.experience}`,
    profile.categories.length > 0 ? `Specializations: ${profile.categories.join(", ")}` : null,
    profile.portfolioLinks?.length ? `Portfolio links: ${profile.portfolioLinks.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are an expert Upwork freelancer who consistently wins projects by writing compelling, personalized cover letters. Write a proposal for the following job that follows Upwork's best practices.

=== JOB POSTING ===
${jobContext}

=== FREELANCER PROFILE ===
${profileContext}
${portfolioContext ? `\n=== PORTFOLIO & PROJECTS ===\n${portfolioContext}` : ""}
=== COVER LETTER GUIDELINES ===

STRUCTURE (follow this order):
1. GREETING: Start with a friendly, professional "Hi" or "Hi [name]" if the company/client name is known. Never use "To Whom It May Concern" or "Dear Sir/Madam".
2. OPENING HOOK (first 1-2 sentences): This is CRITICAL — on Upwork, only the first few sentences appear in the proposal results list. The opening must immediately show you understand the client's specific problem or goal and hook them into reading more. Reference something specific from the job description to prove you read it.
3. RELEVANT EXPERIENCE: Share a specific, concrete example of past work directly relevant to this job. Quantify results with real numbers where possible (e.g. "increased conversions by 25%", "reduced load time by 40%", "managed a team of 5"). Avoid vague buzzwords like "motivated", "team player", "hard-working" — instead demonstrate these qualities through specific accomplishments. If portfolio/project details are provided in the PORTFOLIO & PROJECTS section above, reference SPECIFIC projects by name that are relevant to this job.
4. PROPOSED APPROACH: Briefly outline how you would tackle this specific project — mention 2-3 concrete steps, tools, or methods you'd use. Use bullet points for scannability if listing multiple items.
5. CALL TO ACTION: End with a confident, specific next step. Examples:
   - "I'd be happy to set up a quick call to discuss your goals and walk through my approach."
   - "Let me know if you'd like to see a quick paid test — I'm happy to show what I can do."
   - "Happy to discuss scope, timelines, and next steps — let me know when works for a quick call."
6. SIGN-OFF: Close with your name.${profile.portfolioLinks?.length ? " Include portfolio links after your name." : ""}

TONE & STYLE RULES:
- Write in first person, conversational yet professional tone — sound like a real human, not a template
- Add personality: show genuine enthusiasm for the specific project, not generic excitement
- Be specific throughout — reference actual job requirements, tools mentioned, and client goals
- NEVER use generic filler like "I am a highly motivated professional" or "I have extensive experience"
- Use action verbs: "led", "built", "designed", "shipped", "optimized", "delivered"
- Keep it 200-300 words — clients review many proposals, concise wins
- Make it scannable: use short paragraphs, and bullet points only where they add clarity
- If the job description mentions specific questions or instructions, address them directly

WHAT TO AVOID:
- Do NOT repeat the job description back to the client
- Do NOT list every skill you have — only highlight what's relevant to THIS job
- Do NOT sound desperate or overly flattering
- Do NOT use corporate jargon or buzzwords without substance
- Do NOT write a resume — this is a cover letter showing fit and enthusiasm

Return ONLY the proposal text, no markdown formatting, no labels, no extra commentary.`;
}

export function buildProfileAnalysisPrompt(
  profile: ProfileData,
  userProfile?: UserProfile
): string {
  return `You are an expert Upwork profile consultant. Analyze this freelancer profile and provide actionable improvement suggestions.

PROFILE DATA:
- Name: ${profile.name}
- Title: ${profile.title}
- Bio: ${profile.bio}
- Skills: ${profile.skills.join(", ")}
- Hourly Rate: ${profile.hourlyRate}
- Job Success Score: ${profile.jobSuccessScore}
- Total Earnings: ${profile.totalEarnings}
- Total Jobs: ${profile.totalJobs}
- Location: ${profile.location}
- Portfolio Items: ${profile.portfolio.length}
${userProfile ? `- Target Categories: ${userProfile.categories.join(", ")}` : ""}

Evaluate the profile and return a JSON object with this structure:
{
  "overallScore": <0-100>,
  "sections": [
    { "name": "Title", "score": <0-100>, "suggestions": ["suggestion1", "suggestion2"] },
    { "name": "Bio/Overview", "score": <0-100>, "suggestions": [...] },
    { "name": "Skills", "score": <0-100>, "suggestions": [...] },
    { "name": "Portfolio", "score": <0-100>, "suggestions": [...] },
    { "name": "Rate", "score": <0-100>, "suggestions": [...] },
    { "name": "Completeness", "score": <0-100>, "suggestions": [...] }
  ],
  "summary": "Brief overall assessment"
}

Be specific and actionable. Reference concrete improvements, not vague advice.
Return ONLY the JSON, no extra text.`;
}

export function buildProfileImprovementPrompt(
  job: JobDetailData | ScrapedJob,
  profile: UserProfile
): string {
  const skillNames = profile.skills.map((s) => s.name);
  return `You are an Upwork profile optimization expert. Compare this freelancer's profile against a specific job posting and suggest targeted improvements to increase their chances.

JOB POSTING:
- Title: ${job.title}
- Description: ${"fullDescription" in job ? job.fullDescription : job.description}
- Required Skills: ${job.skills.join(", ")}
- Experience Level: ${job.experienceLevel}
- Budget: ${job.budget}

FREELANCER PROFILE:
- Name: ${profile.name}
- Title: ${profile.title}
- Bio: ${profile.bio}
- Skills: ${skillNames.join(", ")}
- Rate: $${profile.hourlyRateMin}-$${profile.hourlyRateMax}/hr
- Experience: ${profile.experience}
- Categories: ${profile.categories.join(", ")}

Provide suggestions in this JSON format:
{
  "titleSuggestion": "Suggested new title or null if current is good",
  "keywordsToAdd": ["keyword1", "keyword2"],
  "skillsToAdd": ["skill1", "skill2"],
  "bioEdits": "Specific suggested changes to the bio",
  "portfolioTips": ["tip1", "tip2"],
  "overallTip": "One key thing to change"
}

Return ONLY the JSON, no extra text.`;
}

export function buildChatRepliesPrompt(
  chat: ChatData,
  profile: UserProfile
): string {
  const recentMessages = chat.messages.slice(-10);
  return `You are an expert freelancer communication coach. Generate 3 reply options for an Upwork conversation.

CONVERSATION CONTEXT:
- Client: ${chat.contactName}
- Job: ${chat.jobTitle}
- Recent messages:
${recentMessages.map((m) => `  ${m.sender}: ${m.text}`).join("\n")}

FREELANCER PROFILE:
- Name: ${profile.name}
- Title: ${profile.title}
- Skills: ${profile.skills.map((s) => s.name).join(", ")}

Generate 3 reply options with different tones:
1. "brief" — Short, direct, professional (1-3 sentences)
2. "detailed" — Thorough, addresses all points, adds value (1-2 paragraphs)
3. "custom" — Friendly, builds rapport, shows personality (1-2 paragraphs)

Return ONLY a JSON array:
[
  { "tone": "brief", "text": "..." },
  { "tone": "detailed", "text": "..." },
  { "tone": "custom", "text": "..." }
]`;
}

export function buildMeetingPrepPrompt(
  jobContext: string,
  chatContext: string,
  profile: UserProfile
): string {
  return `You are a freelance interview coach. Prepare talking points for an upcoming client meeting.

JOB CONTEXT:
${jobContext}

CONVERSATION HISTORY:
${chatContext}

FREELANCER PROFILE:
- Name: ${profile.name}
- Title: ${profile.title}
- Experience: ${profile.experience}
- Skills: ${profile.skills.map((s) => s.name).join(", ")}

Generate meeting preparation in this JSON format:
{
  "talkingPoints": ["point1", "point2", "point3", "point4", "point5"],
  "likelyQuestions": ["question1", "question2", "question3", "question4"],
  "preparationTips": ["tip1", "tip2", "tip3"]
}

Return ONLY the JSON, no extra text.`;
}

export function buildPortfolioAnalysisPrompt(
  data: FetchedPortfolioData,
  currentProfile?: UserProfile
): string {
  const sections: string[] = [];

  if (data.github) {
    const g = data.github;
    const repoSummaries = g.repos
      .slice(0, 10)
      .map((r) => {
        let line = `- ${r.name}: ${r.description || "No description"}`;
        if (r.language) line += ` [${r.language}]`;
        if (r.stars > 0) line += ` (${r.stars} stars)`;
        if (r.topics.length > 0) line += ` Topics: ${r.topics.join(", ")}`;
        return line;
      })
      .join("\n");

    const readmes = g.repos
      .filter((r) => r.readme)
      .slice(0, 5)
      .map((r) => `### ${r.name}\n${r.readme}`)
      .join("\n\n");

    sections.push(`=== GITHUB PROFILE ===
Username: ${g.username}
Name: ${g.name || "N/A"}
Bio: ${g.bio || "N/A"}
Location: ${g.location || "N/A"}
Public Repos: ${g.publicRepos}
Followers: ${g.followers}

Top Repositories:
${repoSummaries}
${readmes ? `\nREADME Excerpts:\n${readmes}` : ""}`);
  }

  if (data.website) {
    sections.push(`=== PORTFOLIO WEBSITE ===
URL: ${data.website.url}
Title: ${data.website.title}
Content:
${data.website.extractedText}`);
  }

  const profileSection = currentProfile
    ? `\n=== CURRENT UPWORK PROFILE ===
Name: ${currentProfile.name}
Title: ${currentProfile.title}
Bio: ${currentProfile.bio}
Skills: ${currentProfile.skills.map((s) => s.name).join(", ")}
Rate: $${currentProfile.hourlyRateMin}-$${currentProfile.hourlyRateMax}/hr
Experience: ${currentProfile.experience}
Categories: ${currentProfile.categories.join(", ")}\n`
    : "";

  return `You are an expert Upwork profile strategist. Analyze this developer's GitHub profile and/or portfolio website to generate optimized Upwork profile suggestions.

${sections.join("\n\n")}
${profileSection}
Based on the projects, technologies, and experience demonstrated above, generate comprehensive Upwork profile suggestions.

Return a JSON object with this exact structure:
{
  "suggestedTitles": ["Title Option 1", "Title Option 2", "Title Option 3"],
  "suggestedBio": "A professional Upwork overview/bio (150-250 words). Write in first person. Highlight specific projects and achievements from the portfolio. Include concrete technologies and results. Make it compelling for clients.",
  "suggestedSkills": [
    { "name": "Skill Name", "level": 4, "source": "project or repo name where this was demonstrated" }
  ],
  "rateRecommendation": {
    "min": 40,
    "max": 75,
    "reasoning": "Explanation based on skill level, technologies, and market rates"
  },
  "portfolioHighlights": [
    {
      "projectName": "Project Name",
      "description": "Compelling description of the project suitable for an Upwork portfolio entry (2-3 sentences). Focus on the problem solved, technologies used, and impact.",
      "relevantSkills": ["skill1", "skill2"]
    }
  ],
  "completenessAssessment": {
    "score": 75,
    "strengths": ["What the profile data shows well"],
    "gaps": ["What's missing or weak"],
    "recommendations": ["Specific actionable steps to improve"]
  }
}

Guidelines:
- Suggest 3 distinct professional titles targeting different niches the developer could serve
- Skills should include both technical skills from repos AND soft/professional skills inferred from project complexity
- Level scale: 1=Beginner, 2=Familiar, 3=Proficient, 4=Advanced, 5=Expert — base on evidence from repos
- Rate recommendation should reflect the developer's apparent experience level and technology stack market value (in USD)
- Portfolio highlights: pick the 3-5 most impressive/marketable projects
- Completeness assessment: evaluate how well the available data supports a strong Upwork profile
${currentProfile ? "- Since a current profile exists, tailor suggestions to complement and improve it rather than replace everything" : ""}

Return ONLY the JSON, no extra text.`;
}
