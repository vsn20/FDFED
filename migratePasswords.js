const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/users"); // Update path to your User model

// MongoDB connection string - replace with your actual connection string
const MONGO_URI = "mongodb+srv://ELECTROLAND:ELECTROLAND@cluster0.mc5xp0c.mongodb.net/ELECTROLAND";

async function migratePasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Check if password is already hashed (bcrypt hashes start with $2b$)
        if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$")) {
          console.log(`User ${user.user_id} already has hashed password - skipping`);
          skippedCount++;
          continue;
        }

        // Hash the plain text password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);

        // Update the user's password directly in the database (bypass validation)
        await User.updateOne(
          { _id: user._id }, 
          { $set: { password: hashedPassword } },
          { runValidators: false } // Skip validation to avoid minlength check
        );

        console.log(`✓ Migrated password for user: ${user.user_id}`);
        migratedCount++;
      } catch (error) {
        console.error(`✗ Error migrating user ${user.user_id}:`, error.message);
        errorCount++;
      }
    }

    console.log("\n=== Migration Complete ===");
    console.log(`Successfully migrated: ${migratedCount} users`);
    console.log(`Skipped (already hashed): ${skippedCount} users`);
    console.log(`Errors: ${errorCount} users`);

    // Close the connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migratePasswords();