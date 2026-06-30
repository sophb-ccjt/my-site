export default async function handler(request, response) {
    fs.readdir("/frontend/assets/themes", (err, files) => {
        if (err) console.log(err);
        else {
            files.sort((a, b) => {
                if (a.includes('(') && !b.includes('(')) {
                    return -1;
                } else if (!a.includes('(') && b.includes('(')) {
                    return 1;
                } else {
                    return a.localeCompare(b);
                }
            });
            return response.status(200).json(files);
        }
    });
}
