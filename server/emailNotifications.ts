import { db } from "./db";
import { users, profiles } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "./sendgrid";
import { Role } from "@shared/schema";

interface AdminEmailData {
  subject: string;
  htmlContent: string;
  textContent: string;
}

/**
 * Send an email notification to all admin users
 */
export async function notifyAllAdmins(emailData: AdminEmailData): Promise<boolean> {
  try {
    // Query all admin users
    const adminUsers = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
      })
      .from(users)
      .where(eq(users.role, Role.ADMIN));

    if (adminUsers.length === 0) {
      console.warn("No admin users found to send notification");
      return false;
    }

    const fromEmail = process.env.FROM_EMAIL || "sam@growbig.ag";
    
    // Send email to each admin
    const emailPromises = adminUsers.map(admin =>
      sendEmail({
        to: admin.email,
        from: fromEmail,
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    // Check if all emails were sent successfully
    const allSuccessful = results.every(result => result.status === 'fulfilled' && result.value === true);
    
    if (!allSuccessful) {
      console.error("Some admin emails failed to send:", results.filter(r => r.status === 'rejected'));
    }
    
    return allSuccessful;
  } catch (error) {
    console.error("Error sending admin notifications:", error);
    return false;
  }
}

/**
 * Format contact form submission for admin notification
 */
export function formatContactFormEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): AdminEmailData {
  return {
    subject: `UGGA Contact Form: ${data.subject}`,
    htmlContent: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><em>This message was sent through the UGGA contact form. Reply directly to respond to the sender.</em></p>
    `,
    textContent: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

This message was sent through the UGGA contact form. Reply directly to respond to the sender.
    `,
  };
}

/**
 * Format feedback submission for admin notification
 */
export function formatFeedbackEmail(data: {
  userName: string;
  userEmail: string;
  memberSince: string;
  organization: string;
  state: string;
  type: string;
  subject: string;
  message: string;
}): AdminEmailData {
  return {
    subject: `[UGGA ${data.type.toUpperCase()}] ${data.subject}`,
    htmlContent: `
      <h2>New ${data.type} from UGGA Member</h2>
      <p><strong>From:</strong> ${data.userName} (${data.userEmail})</p>
      <p><strong>Member Since:</strong> ${data.memberSince}</p>
      <p><strong>Organization:</strong> ${data.organization}</p>
      <p><strong>State:</strong> ${data.state}</p>
      <p><strong>Type:</strong> ${data.type}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><em>This message was sent through the UGGA member dashboard. Reply directly to respond to the member.</em></p>
    `,
    textContent: `
New ${data.type} from UGGA Member

From: ${data.userName} (${data.userEmail})
Member Since: ${data.memberSince}
Organization: ${data.organization}
State: ${data.state}
Type: ${data.type}
Subject: ${data.subject}

Message:
${data.message}

This message was sent through the UGGA member dashboard. Reply directly to respond to the member.
    `,
  };
}

/**
 * Format challenge submission for admin notification
 */
export function formatChallengeEmail(data: {
  userName: string;
  userEmail: string;
  category: string;
  farmSize: string;
  description: string;
  challengeId: string;
}): AdminEmailData {
  return {
    subject: `New Grower Challenge Submission: ${data.category}`,
    htmlContent: `
      <h2>New Grower Challenge Submitted</h2>
      <p><strong>From:</strong> ${data.userName} (${data.userEmail})</p>
      <p><strong>Challenge ID:</strong> ${data.challengeId}</p>
      <p><strong>Category:</strong> ${data.category}</p>
      <p><strong>Farm Size:</strong> ${data.farmSize}</p>
      <p><strong>Description:</strong></p>
      <p>${data.description.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><em>This challenge was submitted through the UGGA dashboard. You can view and manage challenges in the admin panel.</em></p>
    `,
    textContent: `
New Grower Challenge Submitted

From: ${data.userName} (${data.userEmail})
Challenge ID: ${data.challengeId}
Category: ${data.category}
Farm Size: ${data.farmSize}

Description:
${data.description}

This challenge was submitted through the UGGA dashboard. You can view and manage challenges in the admin panel.
    `,
  };
}

/**
 * Format expert request for admin notification
 */
export function formatExpertRequestEmail(data: {
  userName: string;
  userEmail: string;
  userPhone: string;
  topic: string;
  description: string;
  preferredContactMethod: string;
  requestId: string;
}): AdminEmailData {
  return {
    subject: `New Expert Help Request: ${data.topic}`,
    htmlContent: `
      <h2>New Expert Help Request</h2>
      <p><strong>From:</strong> ${data.userName} (${data.userEmail})</p>
      <p><strong>Phone:</strong> ${data.userPhone}</p>
      <p><strong>Request ID:</strong> ${data.requestId}</p>
      <p><strong>Topic:</strong> ${data.topic}</p>
      <p><strong>Preferred Contact Method:</strong> ${data.preferredContactMethod}</p>
      <p><strong>Description:</strong></p>
      <p>${data.description.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><em>This expert request was submitted through the Ask an Expert page. You can view and manage requests in the admin panel.</em></p>
    `,
    textContent: `
New Expert Help Request

From: ${data.userName} (${data.userEmail})
Phone: ${data.userPhone}
Request ID: ${data.requestId}
Topic: ${data.topic}
Preferred Contact Method: ${data.preferredContactMethod}

Description:
${data.description}

This expert request was submitted through the Ask an Expert page. You can view and manage requests in the admin panel.
    `,
  };
}
