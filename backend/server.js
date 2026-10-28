
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const path = require("path");
const supabase = require("./supabase");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(express.json({ limit: "20kb" }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Validate resource input
function validateResource(body) {
  const { title, description, category, location, contact } = body;

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof category !== "string" ||
    typeof location !== "string" ||
    typeof contact !== "string"
  ) {
    return "All fields must be provided as text.";
  }

  if (
    !title.trim() ||
    !description.trim() ||
    !category.trim() ||
    !location.trim() ||
    !contact.trim()
  ) {
    return "All fields are required.";
  }

  if (
    title.length > 100 ||
    description.length > 1000 ||
    category.length > 50 ||
    location.length > 150 ||
    contact.length > 150
  ) {
    return "One or more fields exceed the allowed length.";
  }

  return null;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Community Help Platform backend is running"
  });
});

// Get all resources
app.get("/api/resources", async (req, res) => {
  try {
    let query = supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (req.query.category) {
      query = query.eq("category", req.query.category);
    }

    if (req.query.search) {
      const search = String(req.query.search).trim();

      if (search.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Search text is too long."
        });
      }

      if (search) {
        query = query.ilike(
          "title",
          `%${search.replace(/[%_,()]/g, "")}%`
        );
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Get resources failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch resources."
    });
  }
});

// Add a new resource
app.post("/api/resources", async (req, res) => {
  const validationError = validateResource(req.body);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    const resource = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      category: req.body.category.trim(),
      location: req.body.location.trim(),
      contact: req.body.contact.trim()
    };

    const { data, error } = await supabase
      .from("resources")
      .insert([resource])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Resource added successfully.",
      data
    });
  } catch (error) {
    console.error("Create resource failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to add resource."
    });
  }
});

// Update a resource
app.put("/api/resources/:id", async (req, res) => {
  const { id } = req.params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID."
    });
  }

  const validationError = validateResource(req.body);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    const resource = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      category: req.body.category.trim(),
      location: req.body.location.trim(),
      contact: req.body.contact.trim()
    };

    const { data, error } = await supabase
      .from("resources")
      .update(resource)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Resource not found."
      });
    }

    res.json({
      success: true,
      message: "Resource updated successfully.",
      data
    });
  } catch (error) {
    console.error("Update resource failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update resource."
    });
  }
});

// Delete a resource
app.delete("/api/resources/:id", async (req, res) => {
  const { id } = req.params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID."
    });
  }

  try {
    const { data, error } = await supabase
      .from("resources")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Resource not found."
      });
    }

    res.json({
      success: true,
      message: "Resource deleted successfully."
    });
  } catch (error) {
    console.error("Delete resource failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to delete resource."
    });
  }
});

// Handle invalid API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

// Central error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  console.error("Server error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
