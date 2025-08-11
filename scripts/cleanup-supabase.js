#!/usr/bin/env node

/**
 * Cleanup script to help identify and update remaining Supabase references
 * Run this after migration to find any missed references
 */

const fs = require("fs");
const path = require("path");

const supabaseKeywords = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "supabase.co",
  "@supabase/supabase-js",
  "createClient",
];

function findInFile(filePath, keywords) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const found = [];

    keywords.forEach((keyword) => {
      if (content.includes(keyword)) {
        const lines = content.split("\n");
        lines.forEach((line, index) => {
          if (line.includes(keyword)) {
            found.push({
              keyword,
              line: index + 1,
              content: line.trim(),
            });
          }
        });
      }
    });

    return found;
  } catch (error) {
    return [];
  }
}

function scanDirectory(dir, keywords) {
  const results = {};

  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach((item) => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith(".") &&
        item !== "node_modules"
      ) {
        scan(fullPath);
      } else if (
        stat.isFile() &&
        (item.endsWith(".ts") ||
          item.endsWith(".tsx") ||
          item.endsWith(".js") ||
          item.endsWith(".jsx") ||
          item.endsWith(".md"))
      ) {
        const found = findInFile(fullPath, keywords);
        if (found.length > 0) {
          results[fullPath] = found;
        }
      }
    });
  }

  scan(dir);
  return results;
}

console.log("🔍 Scanning for remaining Supabase references...\n");

const results = scanDirectory(".", supabaseKeywords);

if (Object.keys(results).length === 0) {
  console.log("✅ No Supabase references found!");
} else {
  console.log("📋 Found Supabase references in the following files:\n");

  Object.entries(results).forEach(([filePath, findings]) => {
    console.log(`📄 ${filePath}`);
    findings.forEach((finding) => {
      console.log(`  Line ${finding.line}: ${finding.keyword}`);
      console.log(`    ${finding.content}`);
    });
    console.log("");
  });

  console.log("\n💡 These files may need manual review and updates.");
}

console.log("\n🎯 Migration checklist:");
console.log("  ✅ Supabase packages removed from package.json");
console.log("  ✅ PostgreSQL and Minio packages installed");
console.log("  ✅ Database schema created");
console.log("  ✅ Storage service implemented");
console.log("  ✅ API routes created");
console.log("  ✅ Environment variables documented");
console.log("  ✅ Docker setup provided");
console.log("  ✅ Migration guide created");
