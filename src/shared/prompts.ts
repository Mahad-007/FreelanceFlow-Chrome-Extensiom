import type { UserProfile, ScrapedJob, JobDetailData, ProfileData, ChatData, FetchedPortfolioData } from "./types";

export function buildScoreJobsPrompt(
  jobs: ScrapedJob[],
  profile: UserProfile,
  portfolioData?: FetchedPortfolioData
): string {
  const skillNames = profile.skills.map((s) => s.name);

  const portfolioSection = portfolioData?.github?.repos?.length
    ? `\nPROJECTS/PORTFOLIO:\n${portfolioData.github.repos
        .slice(0, 8)
        .map((r) => `- ${r.name}: ${r.description || "N/A"} [${r.language || "N/A"}]${r.topics.length ? ` (${r.topics.join(", ")})` : ""}`)
        .join("\n")}`
    : "";

  return `You are a freelance job matching expert. Score each job 0-100 based on how well it matches this freelancer's profile, portfolio, and competition level. Provide a brief reason for each score.

PROFILE:
- Name: ${profile.name}
- Title: ${profile.title}
- Skills: ${skillNames.join(", ")}
- Hourly Rate: $${profile.hourlyRateMin}-$${profile.hourlyRateMax}
- Experience: ${profile.experience}
- Categories: ${profile.categories.join(", ")}
${portfolioSection}

SCORING FACTORS (use these weights):
1. Skill match (40%): How well do the freelancer's skills and project experience match the job requirements?
2. Portfolio relevance (20%): Does the freelancer have demonstrable projects related to this job?
3. Rate fit (15%): Is the freelancer's rate compatible with the job budget?
4. Competition level (15%): Jobs with fewer proposals should score higher (less competition = better odds). "Less than 5" proposals = boost score by 5-10 points. "50+" proposals = reduce score by 5-10 points.
5. Experience level match (10%): Does the required experience level align with the freelancer's level?

JOBS:
${jobs.map((j, i) => `[${i}] ID: ${j.id}\nTitle: ${j.title}\nDescription: ${j.description.slice(0, 500)}\nSkills: ${j.skills.join(", ")}\nBudget: ${j.budget}\nProposals: ${j.proposals || "Unknown"}`).join("\n\n")}

Return ONLY a JSON array of objects with "id", "score", and "reason" fields. Example: [{"id":"abc","score":85,"reason":"Strong skill match in React and TypeScript, low competition (5 proposals)"}]
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

  const questions = "questions" in job && (job as JobDetailData).questions?.length
    ? (job as JobDetailData).questions
    : [];

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

  const questionsSection = questions.length > 0
    ? `\n=== SCREENING QUESTIONS ===\n${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
    : "";

  return `You are ghostwriting a complete Upwork proposal for a real freelancer. Your writing must be indistinguishable from how a skilled, busy developer actually writes. Think casual email to a potential collaborator, NOT a polished application letter.

=== JOB POSTING ===
${jobContext}
${questionsSection}

=== FREELANCER PROFILE ===
${profileContext}
${portfolioContext ? `\n=== PORTFOLIO & PROJECTS ===\n${portfolioContext}` : ""}

=== COVER LETTER GUIDELINES ===

STRUCTURE (follow this order):
1. GREETING: Start with "Hi" or "Hey" — casual, not formal.
2. OPENING HOOK (first 1-2 sentences): CRITICAL — reference something specific from the job description that caught your eye. Show you read it.
3. RELEVANT EXPERIENCE: Share ONE specific, concrete example. Use real numbers if possible. Reference a SPECIFIC project by name if portfolio data is available.
4. PROPOSED APPROACH: Briefly outline how you'd tackle this — 2-3 concrete steps or tools.
5. CALL TO ACTION: Ask a question about the project to show genuine interest.
6. SIGN-OFF: Close with your name.${profile.portfolioLinks?.length ? " Include portfolio links after your name." : ""}

TONE & STYLE RULES:
- Write like a quick email to someone you'd enjoy working with
- Use contractions always (I'm, I've, you'll, it's, don't)
- Short paragraphs. Mix sentence lengths. Some sentences can be fragments.
- Ask a genuine question about their project
- Keep it 200-300 words max
- Use action verbs: "built", "shipped", "set up", "fixed", "redesigned"

BANNED PHRASES (never use these or anything similar):
- "I came across your posting" / "I noticed your job posting"
- "I am confident that" / "I would love the opportunity"
- "I am the ideal candidate" / "This aligns perfectly with"
- "I am well-versed in" / "I bring a wealth of"
- "I am eager to" / "Rest assured" / "I am excited about"
- "I look forward to the opportunity" / "Don't hesitate to reach out"
- "comprehensive solution" / "seamless experience"
- "robust and scalable" / "leverage my expertise"
- "deliver high-quality results" / "exceed expectations"
- "unique blend of" / "proven track record"
- Any sentence starting with "As a [adjective] [profession]"
- Any sentence starting with "With X years of experience"

WHAT GOOD HUMAN WRITING LOOKS LIKE:
- "Hey! I read through your project — the part about [specific thing] stood out."
- "I built something similar last year for [client type]. Here's what I did: ..."
- "Quick question before I dive in: are you looking for X or Y?"

Return a JSON object with this exact structure:
{
  "coverLetter": "The full cover letter text following all guidelines above",
  "screeningAnswers": [
    { "question": "The original question text", "answer": "A thoughtful, specific answer based on the freelancer's experience" }
  ],
  "bidSuggestion": {
    "amount": 50,
    "type": "hourly or fixed",
    "reasoning": "Brief explanation of why this bid amount is appropriate"
  },
  "paymentTerms": "Suggested payment terms or milestone structure appropriate for this job",
  "attachmentRecommendations": ["What portfolio pieces, code samples, or documents to attach and why"]
}

${questions.length > 0 ? `ANSWER THESE SCREENING QUESTIONS in screeningAnswers:\n${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}` : "If no screening questions are provided, return an empty screeningAnswers array."}

For bidSuggestion: base the amount on the job budget, freelancer's rate ($${profile.hourlyRateMin}-$${profile.hourlyRateMax}/hr), and the job type (${job.budget || "not specified"}).
For paymentTerms: suggest milestones for fixed-price or weekly billing for hourly jobs.
For attachmentRecommendations: suggest 1-3 relevant items based on the job requirements and freelancer's portfolio.

Return ONLY the JSON, no extra text.`;
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
  "suggestedBio": "Write a 150-250 word Upwork bio in first person. RULES: Casual-professional tone, like explaining your work to a friend who might hire you. Use contractions (I'm, I've, don't). Short sentences. Mix lengths naturally. Start with what you actually do day-to-day, not a grand intro. Mention specific projects by name from the portfolio. Weave technologies into sentences naturally, don't dump a list. Include one concrete number or result if available. End with what kind of work you're looking for, stated simply. NEVER USE these words or phrases: 'passionate', 'dedicated', 'innovative', 'cutting-edge', 'leverage', 'showcasing', 'driven', 'committed', 'proven track record', 'extensive experience', 'thrive on', 'excited to', 'I bring expertise in', 'I am a highly skilled', 'with a proven track record'. If it sounds like LinkedIn or ChatGPT wrote it, rewrite it.",
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
  },
  "testimonialGuidance": [
    {
      "context": "After which project or work should they request a testimonial",
      "sampleRequest": "A short message template they can send to a past client or collaborator asking for a testimonial",
      "tips": ["Tip for getting a good testimonial"]
    }
  ],
  "certificationRecommendations": [
    { "name": "Certification Name", "provider": "Provider", "relevance": "Why this cert matters", "priority": "high" }
  ],
  "employmentSuggestions": [
    { "title": "Role title to list", "description": "How to describe this role based on their project work", "skills": ["skill1"] }
  ],
  "educationSuggestions": [
    { "suggestion": "Course or credential to pursue", "type": "course" }
  ],
  "projectCatalog": [
    { "projectName": "Name", "clientType": "Startup/Enterprise/Personal", "outcome": "What was achieved", "suggestedDescription": "Client-facing description for Upwork project catalog" }
  ],
  "otherExperiences": ["Freeform suggestion for Other Experiences section"]
}

Guidelines:
- Suggest 3 distinct professional titles targeting different niches the developer could serve
- Generate exactly 20 skills. ALL must be technical skills (programming languages, frameworks, libraries, tools, platforms, databases, APIs, protocols, etc.). Do NOT include soft skills or personal traits like "communication", "teamwork", "project management", "problem-solving", "leadership", "time management"
- Level scale: 1=Beginner, 2=Familiar, 3=Proficient, 4=Advanced, 5=Expert — base on evidence from repos
- Rate recommendation should reflect the developer's apparent experience level and technology stack market value (in USD)
- Portfolio highlights: pick the 3-5 most impressive/marketable projects
- Completeness assessment: evaluate how well the available data supports a strong Upwork profile
- testimonialGuidance: Generate 2-3 suggestions for requesting testimonials based on visible projects. Include a ready-to-send message template for each.
- certificationRecommendations: Suggest 3-5 certifications relevant to the technologies found in the portfolio (e.g., AWS, Google Cloud, Meta, etc.)
- employmentSuggestions: Based on project complexity, suggest 2-3 employment history entries they could add to their profile
- educationSuggestions: Recommend 2-3 relevant courses, bootcamps, or credentials. Type must be one of: "formal", "course", "bootcamp", "self-taught"
- projectCatalog: Reframe the top 3-5 projects as client-facing Upwork project catalog entries with outcomes
- otherExperiences: 2-3 suggestions for the "Other Experiences" section (open source contributions, technical writing, speaking, community involvement, etc.)
- Keep each section concise — quality over quantity
${currentProfile ? "- Since a current profile exists, tailor suggestions to complement and improve it rather than replace everything" : ""}

Return ONLY the JSON, no extra text.`;
}

export function buildSearchRecommendationsPrompt(
  profile: UserProfile,
  portfolioData?: FetchedPortfolioData
): string {
  const skillNames = profile.skills.map((s) => s.name);
  const repoInfo = portfolioData?.github?.repos
    ?.slice(0, 10)
    .map((r) => `- ${r.name}: ${r.description || "N/A"} [${r.language || "N/A"}]${r.topics.length ? ` (${r.topics.join(", ")})` : ""}`)
    .join("\n") || "";

  return `You are an Upwork job search strategist. Based on this freelancer's profile and projects, suggest optimized search queries they should use to find the best-matching jobs on Upwork.

PROFILE:
- Title: ${profile.title}
- Skills: ${skillNames.join(", ")}
- Experience: ${profile.experience}
- Categories: ${profile.categories.join(", ")}
- Rate: $${profile.hourlyRateMin}-$${profile.hourlyRateMax}/hr
${repoInfo ? `\nPROJECTS:\n${repoInfo}` : ""}

Generate search recommendations in this JSON format:
{
  "searchQueries": [
    {
      "query": "the exact search string to type into Upwork search",
      "category": "which Upwork category this targets",
      "reasoning": "why this query matches the freelancer's strengths",
      "estimatedCompetition": "low or medium or high"
    }
  ],
  "nicheKeywords": ["keyword1", "keyword2"],
  "avoidKeywords": ["keyword1"],
  "searchTips": ["tip1", "tip2"]
}

Generate 8-10 diverse search queries covering:
- Direct skill matches (e.g., the freelancer's main technologies)
- Niche combinations that reduce competition (e.g., combining two specific skills)
- Industry-specific queries based on project experience
- Queries targeting the freelancer's rate sweet spot
- Emerging or trending variations of their skills

Return ONLY the JSON, no extra text.`;
}
