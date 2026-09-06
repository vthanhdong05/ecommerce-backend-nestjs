-- SELECT * FROM "User"
-- DELETE FROM "Permission"
SELECT *
FROM "Category"
WHERE "parentID" IS NULL
  AND "deletedAt" IS NULL;