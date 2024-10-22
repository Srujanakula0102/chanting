function mergeFiles() {
    const input = document.getElementById('fileInput');
    const files = input.files;
    if (files.length === 0) {
        alert('Please select at least one file.');
        return;
    }

    const data = [];
    const promises = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        promises.push(new Promise((resolve, reject) => {
            reader.onload = (e) => {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                data.push(...sheet);
                resolve();
            };
            reader.onerror = reject;
            reader.readAsBinaryString(file);
        }));
    }

    Promise.all(promises).then(() => {
        const mergedSheet = XLSX.utils.aoa_to_sheet(data);
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, mergedSheet, 'Merged Data');
            const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'binary' });

            const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.getElementById('downloadLink');
            a.href = url;
            a.download = 'merged.xlsx';
            a.style.display = 'block';
            a.textContent = 'Download Merged File';
    }).catch((error) => {
        console.error('Error merging files:', error);
        });
    }

function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
}