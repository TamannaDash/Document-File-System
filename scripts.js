document.getElementById('document-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch('/documents', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            alert('Document submitted successfully');
            loadDocuments();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function loadDocuments() {
    fetch('/documents')
    .then(response => response.json())
    .then(data => {
        const tbody = document.querySelector('#document-table tbody');
        tbody.innerHTML = '';
        data.forEach(doc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${doc.serialNumber}</td>
                <td>${doc.referenceID}</td>
                <td>${new Date(doc.dateOfDocument).toLocaleDateString()}</td>
                <td>${doc.timeOfDocument}</td>
                <td>${doc.subject}</td>
                <td>${doc.fromEntity}</td>
                <td><a href="${doc.pdfPath}" target="_blank">View PDF</a></td>
                <td>
                    ${doc.actions.map(action => `
                        <div>
                            <p>${action.actionName} (Deadline: ${new Date(action.deadline).toLocaleDateString()} ${action.deadlineTime}, Pending: ${new Date(action.pendingDate).toLocaleDateString()})</p>
                            ${action.actionPdfPath ? `<a href="${action.actionPdfPath}" target="_blank">View Action PDF</a>` : ''}
                        </div>
                    `).join('')}
                </td>
                <td>${getReminder(doc.actions)}</td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getReminder(actions) {
    const now = new Date();
    const reminders = actions.map(action => {
        const deadlineDateTime = new Date(`${action.deadline}T${action.deadlineTime}`);
        const timeDiff = deadlineDateTime - now;
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 10) {
            return `<span class="reminder">${daysRemaining} days remaining</span>`;
        }
        return '';
    });
    return reminders.filter(reminder => reminder).join('<br>');
}

loadDocuments();
