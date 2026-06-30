export default async function handler(request, response) {
    return response.status(200).json({ 
        message: "Hello from Vercel Serverless Functions!" 
    });
}
/*
export default {
    async fetch(request) {
        let themes = [];
        fs.readdir("/frontend/assets/themes", (err, files) => {
            if (err) console.log(err);
            else {
                themes = files.toSorted((a, b) => {
                    if (a.includes('(') && !b.includes('(')) {
                        return -1;
                    } else if (!a.includes('(') && b.includes('(')) {
                        return 1;
                    } else {
                        return a.localeCompare(b);
                    }
                });
            }
        });
        return themes;
    },
};
*/
