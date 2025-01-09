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
        const sandbox = await Sandbox.create({
            timeoutMs: 60 * 1000 * 5
        });
        await sandbox.files.write('app.py', code);
        const command = await sandbox.commands.run('streamlit run app.py --server.port=81', {
            background: true // TODO: handle errors via the Application frontend
        });
        return {
            sandboxId: sandbox.sandboxId,
            url: `https://${sandbox.getHost(81)}`
        }
    } else {
        const sandbox = await Sandbox.connect(sandboxId);
        await sandbox.files.write('app.py', code);
        return {
            sandboxId: sandbox.sandboxId,
            url: `https://${sandbox.getHost(81)}`
        }
    }
}