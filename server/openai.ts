import OpenAI from "openai";
import { type Profile, type User } from "@shared/schema";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// Check if OpenAI API key is available
const isOpenAIAvailable = !!(process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR);

export async function findGrowerAI(question: string, members: (User & { profile: Profile })[]): Promise<string> {
  if (!isOpenAIAvailable) {
    return "The AI-powered Find a Grower feature is currently unavailable. Please check back later or contact support for assistance in finding relevant growers.";
  }

  try {
    // Get AI agent configuration from database
    const config = await storage.getAiAgentConfigByType("FIND_GROWER");
    
    // Create a sanitized member directory for the AI prompt
    const memberData = members.map(member => ({
      name: member.profile.name,
      state: member.profile.state,
      farmType: member.profile.farmType,
      employer: member.profile.employer,
      jobTitle: member.profile.jobTitle,
    })).slice(0, 50); // Limit to 50 members to avoid token limits

    // Use configurable prompt or fall back to default
    const basePrompt = config?.systemPrompt || `You are an AI assistant for the United Greenhouse Growers Association (UGGA). Your role is to help members find and connect with other growers based on their specific needs.

Given a member directory and a question, suggest relevant growers who might be able to help. Focus on:
- Geographic proximity when relevant
- Farm type expertise
- Professional experience
- Specific skills or knowledge areas

Be helpful, professional, and specific in your recommendations. If you can't find exact matches, suggest similar alternatives or broader categories.`;

    const systemPrompt = `${basePrompt}

Member Directory (showing name, state, farm type, employer, job title):
${JSON.stringify(memberData, null, 2)}`;

    // Use configurable model settings or fall back to defaults
    const modelConfig = config?.modelConfig as any || {};
    const model = modelConfig.model || "gpt-4o";
    const maxTokens = modelConfig.maxTokens || 500;
    const temperature = modelConfig.temperature || 0.7;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: maxTokens,
      temperature,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't process your request. Please try rephrasing your question.";
  } catch (error) {
    console.error("OpenAI Find Grower error:", error);
    return "The AI service is currently unavailable. Please try again later or contact support for assistance.";
  }
}

export async function assessmentAI(input: string, sessionId?: string): Promise<string> {
  if (!isOpenAIAvailable) {
    return "The AI-powered Farm Assessment feature is currently unavailable. Please check back later or contact support for personalized greenhouse operation guidance.";
  }

  try {
    const systemPrompt = `You are an expert agricultural consultant specializing in greenhouse operations. You provide comprehensive farm assessments and recommendations for greenhouse growers.

Your role is to:
- Analyze greenhouse operations based on user input
- Provide specific, actionable recommendations
- Focus on efficiency, sustainability, and profitability
- Consider factors like climate control, crop selection, pest management, irrigation, and technology adoption
- Give practical advice that growers can implement

Be thorough but concise. Ask follow-up questions when you need more information to provide better recommendations.

${sessionId ? `This is a continuing conversation (Session: ${sessionId}). Reference previous context when relevant.` : 'This is the start of a new farm assessment conversation.'}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input }
      ],
      max_tokens: 800,
      temperature: 0.6,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't process your assessment request. Please provide more details about your greenhouse operation.";
  } catch (error) {
    console.error("OpenAI Assessment error:", error);
    return "The AI assessment service is currently unavailable. Please try again later or contact support for assistance.";
  }
}
