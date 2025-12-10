// demo.js
// Programmatically interacts with the page to add processes and run a simulation.
// Usage:
// - Open the page in the browser and run `runDemo()` from the console, or
// - Append `?demo=1` to the URL and the demo will run automatically once the page is ready.

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDemoSequence() {
    // Wait until the page modules have initialized
    if (!document.getElementById('process-form')) {
        await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve, { once: true });
        });
    }

    // Ensure elements exist
    const arrivalInput = document.getElementById('arrival-time');
    const burstInput = document.getElementById('burst-time');
    const priorityInput = document.getElementById('priority');
    const processForm = document.getElementById('process-form');
    const algorithmSelect = document.getElementById('algorithm-select');
    const quantumInput = document.getElementById('time-quantum');
    const simulateBtn = document.getElementById('simulate-btn');

    if (!processForm || !arrivalInput || !burstInput || !simulateBtn || !algorithmSelect) {
        console.warn('Demo: required DOM elements not found. Make sure script.js is loaded and the page markup matches expected IDs.');
        return;
    }

    // Helper to dispatch submit on the form after setting inputs
    function addProcessViaUI(arrival, burst, priority) {
        arrivalInput.value = String(arrival);
        burstInput.value = String(burst);
        priorityInput.value = String(priority);
        // dispatch submit
        const ev = new Event('submit', { bubbles: true, cancelable: true });
        processForm.dispatchEvent(ev);
    }

    // Clear any existing processes by using the reset button if available
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.click();

    // Add sample processes
    addProcessViaUI(0, 5, 2);
    await wait(120);
    addProcessViaUI(2, 3, 1);
    await wait(120);
    addProcessViaUI(4, 1, 3);
    await wait(120);
    addProcessViaUI(6, 2, 1);
    await wait(200);

    // Choose algorithm (example: SRTF)
    algorithmSelect.value = 'SRTF';
    algorithmSelect.dispatchEvent(new Event('change', { bubbles: true }));

    // If Round Robin chosen set quantum
    if (algorithmSelect.value === 'RR') {
        quantumInput.value = '2';
        quantumInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Trigger simulation
    simulateBtn.click();

    // Wait for simulation visuals to render
    await wait(300);

    // Collect and display results in console
    const avgTat = document.getElementById('avg-tat') ? .textContent || 'n/a';
    const avgWt = document.getElementById('avg-wt') ? .textContent || 'n/a';
    console.log('Demo: Simulation complete. Avg TAT:', avgTat, 'Avg WT:', avgWt);

    // Log Gantt chart blocks
    const blocks = Array.from(document.querySelectorAll('.gantt-block')).map(b => ({ text: b.textContent.trim(), tooltip: b.dataset.tooltip || '' }));
    console.log('Demo: Gantt blocks:', blocks);

    return { avgTat, avgWt, blocks };
}

window.runDemo = async function runDemo() {
    try {
        const res = await runDemoSequence();
        console.info('Demo finished', res);
        return res;
    } catch (err) {
        console.error('Demo failed', err);
        throw err;
    }
};

// Auto-run if URL contains ?demo=1
if (typeof window !== 'undefined' && window.location && window.location.search.includes('demo=1')) {
    // Run after a short delay to allow other modules to init
    setTimeout(() => {
        window.runDemo().catch(() => {});
    }, 300);
}