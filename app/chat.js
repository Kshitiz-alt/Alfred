import axios from 'axios'

async function CallOllama(history) {
    const res = await axios.post("http://localhost:11434/api/chat",{
        model:"mistral",
        messages:history,
        stream:true
    },
    {responseType:"stream"}
    );

    // console.log("AI:",res.data.message.content)

    res.data.on("data",(chunk)=>{
        const lines = chunk.toString().trim().split("\n");
        for(const line of lines){
            if(line){
                const parsed = JSON.parse(line);
                if(parsed.message.content){
                    process.stdout.write(parsed.message.content);
                }
            }
        }
    })
}

CallOllama([{role:"user",content:"say some good things to my gf , Tatiana in russian"}])