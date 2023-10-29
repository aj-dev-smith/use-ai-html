import OpenAI from 'openai';
const { exec } = require('child_process');
const fs = require('fs')


const openai = new OpenAI();


const inputHtml = await Bun.file('ai_index.html').text();

const systemMessage = `
You are an expert at writing HTML, CSS, and Javascript. 
A user will send you a request and you will respond with valid HTML that will be rendered immediately.
Feel free to use css and js in your HTML as needed.
Always be extra creative in your responses.  You'll be given an HTML file that has 'use-ai;' in it followed by some comments.
Follow the user request in 'use-ai;' add add your response INLINE REPLACING THE 'use-ai' SECTION
MAKE SURE TO KEEP THE REST OF THE FILE EXACTLY IN TACT.  ONLY REPLACE THE USE-AI SECTION

You should inject tailwind via this CDN to make things look N I C E  <script src="https://cdn.tailwindcss.com"></script>

Here's the file:
${inputHtml}
`

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: systemMessage }],
    model: 'gpt-4',
  });

  const finishedPage = chatCompletion.choices.pop()?.message.content;
  console.log('response', finishedPage);;

  fs.writeFileSync('index.html', finishedPage);
  exec('open index.html');
}

main();