export function welcomeEmail(displayName: string): { subject: string; html: string } {
  return {
    subject: "Welcome to Apologetics Dojo!",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px; color: #1a1a1a;">
  <h1 style="font-size: 24px; margin-bottom: 8px;">Welcome, ${escapeHtml(displayName)}!</h1>
  <p style="color: #666; line-height: 1.6;">
    You've joined Apologetics Dojo — an AI-powered training ground for defending the Christian faith through structured debate practice.
  </p>
  <h2 style="font-size: 18px; margin-top: 24px;">Here's how to get started:</h2>
  <ol style="color: #666; line-height: 1.8;">
    <li><strong>Pick a topic</strong> — choose from 6 apologetics families</li>
    <li><strong>Face an AI opponent</strong> — 6 distinct personas, 4 difficulty levels</li>
    <li><strong>Get scored</strong> — receive detailed feedback on your arguments</li>
    <li><strong>Rank up</strong> — climb from White belt to Black belt</li>
  </ol>
  <div style="margin-top: 24px;">
    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://apologeticsdojo.com"}/dashboard"
       style="display: inline-block; background: #171717; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Start your first debate
    </a>
  </div>
  <p style="margin-top: 32px; font-size: 13px; color: #999; font-style: italic;">
    "Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have." — 1 Peter 3:15
  </p>
  <hr style="border: none; border-top: 1px solid #eee; margin-top: 32px;" />
  <p style="font-size: 12px; color: #aaa;">Apologetics Dojo</p>
</body>
</html>`.trim(),
  };
}

export function weeklyDigestEmail(
  displayName: string,
  stats: {
    sessionsThisWeek: number;
    pointsThisWeek: number;
    totalPoints: number;
    currentBelt: string;
    topFamily: string | null;
  }
): { subject: string; html: string } {
  return {
    subject: `Your weekly training report — ${stats.pointsThisWeek} pts earned`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px; color: #1a1a1a;">
  <h1 style="font-size: 24px; margin-bottom: 8px;">Weekly Report</h1>
  <p style="color: #666;">Hey ${escapeHtml(displayName)}, here's your training summary for this week:</p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px 0; color: #666;">Sessions completed</td>
      <td style="padding: 10px 0; text-align: right; font-weight: 600;">${stats.sessionsThisWeek}</td>
    </tr>
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px 0; color: #666;">Points earned</td>
      <td style="padding: 10px 0; text-align: right; font-weight: 600;">${stats.pointsThisWeek} pts</td>
    </tr>
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px 0; color: #666;">Total score</td>
      <td style="padding: 10px 0; text-align: right; font-weight: 600;">${stats.totalPoints} pts</td>
    </tr>
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px 0; color: #666;">Current belt</td>
      <td style="padding: 10px 0; text-align: right; font-weight: 600;">${escapeHtml(stats.currentBelt)}</td>
    </tr>
    ${stats.topFamily ? `
    <tr>
      <td style="padding: 10px 0; color: #666;">Strongest topic</td>
      <td style="padding: 10px 0; text-align: right; font-weight: 600;">${escapeHtml(stats.topFamily)}</td>
    </tr>` : ""}
  </table>
  ${stats.sessionsThisWeek === 0 ? `
  <p style="margin-top: 20px; color: #666;">
    You didn't complete any debates this week. Even one short session keeps your skills sharp!
  </p>` : `
  <p style="margin-top: 20px; color: #666;">
    Great work this week! Keep the momentum going.
  </p>`}
  <div style="margin-top: 24px;">
    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://apologeticsdojo.com"}/dashboard"
       style="display: inline-block; background: #171717; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Start a debate
    </a>
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin-top: 32px;" />
  <p style="font-size: 12px; color: #aaa;">Apologetics Dojo · Weekly training digest</p>
</body>
</html>`.trim(),
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
