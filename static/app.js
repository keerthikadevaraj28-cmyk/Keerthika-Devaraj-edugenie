document.addEventListener("DOMContentLoaded", () => {

    const submitBtn = document.getElementById("submitBtn");
    const clearBtn = document.getElementById("clearBtn");
    const inputText = document.getElementById("inputText");
    const task = document.getElementById("task");
    const status = document.getElementById("status");
    const result = document.getElementById("result");


    // ==============================
    // GENERATE BUTTON
    // ==============================

    submitBtn.addEventListener("click", async () => {

        const text = inputText.value.trim();
        const selectedTask = task.value;

        // Check empty input
        if (!text) {
            status.textContent = "Please enter your question.";
            result.innerHTML = "";
            inputText.focus();
            return;
        }

        status.textContent = "Generating...";
        result.innerHTML = "";
        submitBtn.disabled = true;


        // Choose the correct API
        let endpoint;

        switch (selectedTask) {

            case "qa":
                endpoint = "/qa";
                break;

            case "explain":
                endpoint = "/explain";
                break;

            case "quiz":
                endpoint = "/quiz";
                break;

            case "summarize":
                endpoint = "/summarize";
                break;

            case "learn":
                endpoint = "/learn/recommendations";
                break;

            default:
                status.textContent = "Invalid task selected.";
                submitBtn.disabled = false;
                return;
        }


        try {

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: text,
                    count: 3
                })
            });


            const data = await response.json();


            // Check server error
            if (!response.ok) {
                throw new Error(
                    data.detail || "Server error"
                );
            }


            // Display result
            status.textContent = "Generated successfully!";

            result.innerHTML = `
                <h3>Result</h3>
                <div class="answer">
                    ${formatResult(data.result)}
                </div>
            `;


        } catch (error) {

            console.error("Generate Error:", error);

            status.textContent = "Something went wrong.";

            result.innerHTML = `
                <div class="error">
                    <strong>Error:</strong> ${escapeHTML(error.message)}
                </div>
            `;

        } finally {

            submitBtn.disabled = false;

        }

    });


    // ==============================
    // CLEAR BUTTON
    // ==============================

    clearBtn.addEventListener("click", () => {

        inputText.value = "";
        status.textContent = "";
        result.innerHTML = "";

        inputText.focus();

    });


    // ==============================
    // FORMAT RESULT
    // ==============================

    function formatResult(value) {

        if (value === null || value === undefined) {
            return "No result received.";
        }

        // If result is an array
        if (Array.isArray(value)) {

            return value
                .map(item => {
                    if (typeof item === "object") {
                        return `<pre>${escapeHTML(
                            JSON.stringify(item, null, 2)
                        )}</pre>`;
                    }

                    return `<p>${escapeHTML(String(item))}</p>`;
                })
                .join("");
        }


        // If result is an object
        if (typeof value === "object") {

            return `<pre>${escapeHTML(
                JSON.stringify(value, null, 2)
            )}</pre>`;
        }


        // Normal text result
        return escapeHTML(String(value))
            .replace(/\n/g, "<br>");
    }


    // ==============================
    // SECURITY
    // ==============================

    function escapeHTML(text) {

        const div = document.createElement("div");
        div.textContent = text;

        return div.innerHTML;
    }

});