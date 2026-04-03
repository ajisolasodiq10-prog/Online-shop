document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // Clear previous error messages
    document.getElementById("usernameError").textContent = "";
    document.getElementById("passwordError").textContent = "";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validate inputs
    if (!username || !password) {
      if (!username)
        document.getElementById("usernameError").textContent =
          "Username is required.";
      if (!password)
        document.getElementById("passwordError").textContent =
          "Password is required.";
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      document.getElementById("usernameError").textContent =
        "Username can only contain letters, numbers, and underscores.";
      return;
    }

    if (password.length < 6) {
      document.getElementById("passwordError").textContent =
        "Password must be at least 6 characters long.";
      return;
    }

    try {
      // Send login request to the backend
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user info and JWT token
        localStorage.setItem(
          "user",
          JSON.stringify({ username: data.username, email: data.email }),
        );
        localStorage.setItem("token", data.token);

        // Redirect to admin page
        window.location.href = "admin.html";
      } else {
        // Display error message
        if (data.message) {
          alert(data.message);
        } else {
          alert("An error occurred. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });
