import { Sandbox } from '@e2b/code-interpreter';

export async function POST(req: Request) {
    const {
        sandboxId, 
        code
    } = await req.json();

    // Check if the sandbox is running
    const runningSandboxes = await Sandbox.list();
    let foundSandbox = false;
    for(const sandbox of runningSandboxes){
        if(sandbox.sandboxId === sandboxId){
            foundSandbox = true;
            break;
        }
    }

    if(!foundSandbox || !sandboxId){
        console.log("Creating new sandbox");
        const sandbox = await Sandbox.create('pgzzes7f1ztbdszadv6x',
        {
            timeoutMs: 60 * 1000 * 5,
            envs: {
                OPENAI_API_KEY: process.env.OPENAI_API_KEY!
            }
        });
        await sandbox.files.write('app.py', code);
        const command = await sandbox.commands.run('streamlit run app.py --server.port=5000 --server.enableCORS=false  --server.enableXsrfProtection=false', {
            background: true, // TODO: handle errors via the Application frontend
            onStderr: (data) => {
                console.log(data.toString());
            },
            onStdout: (data) => {
                console.log(data.toString());
            }
        });
        return new Response(JSON.stringify(
            {
                sandboxId: sandbox.sandboxId,
                url: `https://${sandbox.getHost(5000)}`
            }
        ));
    } else {
        console.log("Using existing sandbox: ", sandboxId);
        const sandbox = await Sandbox.connect(sandboxId);
        await sandbox.files.write('app.py', code);
        return new Response(JSON.stringify({
            sandboxId: sandbox.sandboxId,
            url: `https://${sandbox.getHost(5000)}`
        }));
    }
}