import React, { useState } from 'react';
import { Agent, Prompt, Action, Task, TTS } from 'react-agents';
import { z } from 'zod';

const GratitudeBuddyAgent = () => {
  const [userProfile, setUserProfile] = useState({
    completedPrompts: 0,
    pendingPrompts: [],
    streak: 0,
    lastPrompt: null, 
  });


  const gratitudePrompts = [
    "What are three things you are grateful for today?",
    "Think about someone who made your day better. What did they do?",
    "What is something in your life that brings you peace?",
    "Take a moment to appreciate your body. What is something about it that you are grateful for?",
    "What was the highlight of your day so far?",
    "Think about something you achieved today, no matter how small. Why are you grateful for it?",
    "Think about your home or the space you're in. What part of it makes you feel comfortable and safe?",
  ];


  const generateGratitudePrompt = () => {
    return gratitudePrompts[Math.floor(Math.random() * gratitudePrompts.length)];
  };

  const trackPromptCompletion = () => {
    setUserProfile(prev => ({
      ...prev,
      completedPrompts: prev.completedPrompts + 1,
      streak: prev.streak + 1,
    }));
  };

  return (
    <>
      <TTS voiceEndpoint="elevenlabs:kadio:YkP683vAWY3rTjcuq2hX" />
      
      {/* Actions */}
      <Action
        name="getDailyGratitudePrompt"
        description="Provide a daily gratitude prompt for the user to reflect on"
        schema={z.object({
          prompt: z.string(),
        })}
        examples={[
          { prompt: "What are three things you are grateful for today?" }
        ]}
        handler={async (e) => {
          const prompt = generateGratitudePrompt();
          setUserProfile(prev => ({
            ...prev,
            pendingPrompts: [...prev.pendingPrompts, prompt],
            lastPrompt: prompt, 
          }));
          await e.data.agent.monologue(
            `Today's gratitude prompt: "${prompt}". Take a moment to reflect on it.`
          );
          await e.commit();
        }}
      />

      <Action
        name="completeGratitudePrompt"
        description="Mark the current gratitude prompt as completed and ask for feedback"
        schema={z.object({
          prompt: z.string(),
          feedback: z.string().optional(),
        })}
        examples={[
          { prompt: "What are three things you are grateful for today?", feedback: "I am grateful for my health, my family, and my work." }
        ]}
        handler={async (e) => {
          const prompt = userProfile.pendingPrompts[0];
          if (prompt) {
            trackPromptCompletion();
            setUserProfile(prev => ({
              ...prev,
              pendingPrompts: prev.pendingPrompts.slice(1),
            }));
            await e.data.agent.monologue(
              `Great job reflecting on your gratitude! Here's what you shared: "${prompt}". Keep up the great work!`
            );
          } else {
            await e.data.agent.monologue("You don't have any pending gratitude prompts. Why not reflect on some today?");
          }
          await e.commit();
        }}
      />

      <Action
        name="provideFeedback"
        description="Receive and acknowledge the user's feedback on the gratitude prompt"
        schema={z.object({
          feedback: z.string(),
        })}
        examples={[
          { feedback: "I felt much more grounded after reflecting on my blessings." }
        ]}
        handler={async (e) => {
          const feedback = e.input.feedback;
          await e.data.agent.monologue(
            `Thank you for sharing your reflection! Here's what you shared: "${feedback}". I'm glad to be part of your gratitude practice.`
          );
          await e.commit();
        }}
      />

      {/* New Action: Share Gratitude Reflection */}
      <Action
        name="shareGratitudeReflection"
        description="Allow the user to share what they are grateful for, and the agent will provide a supportive response."
        schema={z.object({
          reflection: z.string(),
        })}
        examples={[
          { reflection: "I'm grateful for the love and support of my family." }
        ]}
        handler={async (e) => {
          const reflection = e.input.reflection;
          await e.data.agent.monologue(
            `Thank you for sharing your reflection! Here's what you said: "${reflection}". It's beautiful to hear what you're grateful for, and I truly appreciate you taking the time to reflect. Keep up the great work, and remember, gratitude brings so much positivity into our lives!`
          );
          await e.commit();
        }}
      />

      {/* New Action: Provide Encouragement */}
      <Action
        name="provideEncouragement"
        description="Provide an encouraging message to support the user's mental wellness"
        schema={z.object({
          message: z.string(),
        })}
        examples={[
          { message: "You're doing an amazing job nurturing your mental health and practicing gratitude." }
        ]}
        handler={async (e) => {
          const encouragementMessages = [
            "You are doing wonderfully, and every moment of gratitude is a step forward in your wellness journey.",
            "Great job taking time for yourself and reflecting on what matters most to you. Keep going!",
            "Your commitment to mental wellness and gratitude is truly inspiring. Keep up the great work!",
            "Every small step you take toward gratitude is a big leap toward mental clarity and peace. You're doing awesome!",
            "Remember, you're worthy of all the good things that come your way. Keep focusing on your blessings!"
          ];
          const message = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
          await e.data.agent.monologue(message);
          await e.commit();
        }}
      />

      {/* Tasks */}
      <Task
        schedule="every day at 9:00"
        handler={async (e) => {
          const prompt = generateGratitudePrompt();
          await e.data.agent.monologue(`Good morning! Here's your gratitude prompt for today: "${prompt}"`);
          await e.commit();
        }}
      />

      <Task
        schedule="every day at 10:00"
        handler={async (e) => {
          if (userProfile.lastPrompt) {
            await e.data.agent.monologue(
              `Yesterday's gratitude prompt was: "${userProfile.lastPrompt}". How did it go? I'd love to hear about your reflections.`
            );
          }
          await e.commit();
        }}
      />

      <Task
        schedule="every day at 20:00"
        handler={async (e) => {
          if (userProfile.pendingPrompts.length > 0) {
            const prompt = userProfile.pendingPrompts[0];
            await e.data.agent.monologue(
              `Reminder: Don't forget about today's gratitude prompt: "${prompt}". Take a moment to reflect and be thankful!`
            );
          } else {
            await e.data.agent.monologue("You're all caught up! Keep reflecting on your gratitude daily.");
          }
          await e.commit();
        }}
      />

      <Task
        schedule="every day at 00:00"
        handler={async (e) => {
          const newStreak = userProfile.pendingPrompts.length === 0 ? userProfile.streak : 0;
          setUserProfile(prev => ({
            ...prev,
            pendingPrompts: [],
            streak: newStreak,
            lastPrompt: null,
          }));
          await e.data.agent.monologue("A new day starts! Get ready to reflect on today's gratitude prompt.");
          await e.commit();
        }}
      />

      {/* Prompt */}
      <Prompt>
        You are Gratitude Buddy, a positive and supportive AI assistant. Your role is to:

        1. Provide a daily gratitude prompt each morning to encourage reflection and mindfulness.
        2. Track the completion of daily gratitude reflections and provide feedback.
        3. Send friendly reminders to complete pending gratitude reflections.
        4. Offer progress reports on the user's dedication to their gratitude practice.
        5. Respond empathetically to user feedback and encourage consistent gratitude practice.
        6. Provide words of encouragement to support the user's mental wellness journey.

        Remember to be supportive, positive, and encouraging in all interactions. Provide meaningful prompts that encourage deep reflection and mental wellness.
      </Prompt>
    </>
  );
};

export default function GratitudeBuddy() {
  return (
    <Agent>
      <GratitudeBuddyAgent />
    </Agent>
  );
}
