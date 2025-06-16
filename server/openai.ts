import OpenAI from "openai";
import { type Profile, type User } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function findGrowerAI(question: string, members: (User & { profile: Profile })[]): Promise<string> {
  try {
    // Create a sanitized member directory for the AI prompt
    const memberData = members.map(member => ({
      name: member.profile.name,
      state: member.profile.state,
      farmType: member.profile.farmType,
      employer: member.profile.employer,
      jobTitle: member.profile.jobTitle,
    })).slice(0, 50); // Limit to 50 members to avoid token limits

    const systemPrompt = `You are an AI assistant for the United Greenhouse Growers Association (UGGA). Your role is to help members find and connect with other growers based on their specific needs.

Given a member directory and a question, suggest relevant growers who might be able to help. Focus on:
- Geographic proximity when relevant
- Farm type expertise
- Professional experience
- Specific skills or knowledge areas

Be helpful, professional, and specific in your recommendations. If you can't find exact matches, suggest similar alternatives or broader categories.

Member Directory (showing name, state, farm type, employer, job title):
${JSON.stringify(memberData, null, 2)}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't process your request. Please try rephrasing your question.";
  } catch (error) {
    console.error("OpenAI Find Grower error:", error);
    throw new Error("AI service is currently unavailable. Please try again later.");
  }
}

export async function assessmentAI(input: string, sessionId?: string): Promise<string> {
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
    throw new Error("AI assessment service is currently unavailable. Please try again later.");
  }
}
