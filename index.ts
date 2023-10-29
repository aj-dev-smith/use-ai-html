
import * as fs from 'fs';
import OpenAI from 'openai';
const openai = new OpenAI();

const inputHtml = await Bun.file('index.html').text();

const systemMessage = `
You are an expert at writing HTML, CSS, and Javascript. 
A user will send you a request and you will respond with valid HTML that will be rendered immediately.
Feel free to use css and js in your HTML as needed.
Always be extra creative in your responses.  You'll be given an HTML file that has 'use-ai;' in it followed by some comments.
Follow the user request in 'use-ai;' add add your response INLINE REPLACING THE 'use-ai' SECTION
MAKE SURE TO KEEP THE REST OF THE FILE EXACTLY IN TACT.  ONLY REPLACE THE USE-AI SECTION

You should inject tailwind via this specific CDN to make things look N I C E  <script src="https://cdn.tailwindcss.com"></script>.
Keep it clean and modern.
Don't use inline svgs.  Only respond directly with HTML. Always add something interactive with JS. 

Here's the file:
${inputHtml}
`

async function main() {
  const stream = await openai.chat.completions.create({
    messages: [{ role: 'system', content: systemMessage }],
    model: 'gpt-4',
    stream: true
  });

  // First clear index.html
  fs.writeFileSync('index.html', '', 'utf8');

  // Update continuously.  end stream each time to force page refresh
  let pageSoFar = '';
  for await (const part of stream) {
    const content = part.choices[0]?.delta?.content || '';
    pageSoFar+=content;
    fs.writeFileSync('index.html', pageSoFar, 'utf8');
  }
}

main();
