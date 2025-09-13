import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    
    const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
    const webToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

    if (!workflowId || !webToken) {
      return Response.json({ success: false, error: "Missing VAPI environment variables" }, { status: 500 });
    }

    const response = await fetch(`https://api.vapi.ai/v1/workflows/${workflowId}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${webToken}`,
      },
      body: JSON.stringify({
        input: `
          Prepare questions for a job interview.
          The job role is ${role}.
          The job experience level is ${level}.
          The tech stack used in the job is: ${techstack}.
          The focus between behavioural and technical questions should lean towards: ${type}.
          The amount of questions required is: ${amount}.
          Please return only the questions in JSON format:
          ["Question 1", "Question 2", "Question 3"]
        `,
      }),
    });

    const data = await response.json();
    const aiOutput = data.output?.text ?? "";

    let parsedQuestions: string[] = [];
    try {
      parsedQuestions = JSON.parse(aiOutput);
    } catch (err) {
      console.error("Failed to parse AI response:", aiOutput, err);
      return Response.json({ success: false, error: "Bad AI response" }, { status: 500 });
    }

    // Save interview in Firestore
    const interview = {
      role, type, level,
      techstack: techstack.split(","),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true, questions: parsedQuestions }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error }, { status: 500 });
  }
}
