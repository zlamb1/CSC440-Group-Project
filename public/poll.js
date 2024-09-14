const eventSource = new EventSource(`/live-server`);
eventSource.onmessage = async (event) => {
    // refresh page on update
    location.reload();
}