const fs = require('fs');
export default async function handler(request, response) {
    response.status(200).text('WIP!');
    fs.readdir("/assets/themes", (err, files) => {
        if (err) console.error(err);
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
