SELECT p."id", p."postedAt", p."content", p."replyTo", p."lastEdited", p."userId",
COALESCE(SUM(CASE WHEN l."liked" THEN 1 ELSE 0 END), 0)::INTEGER AS likes,
COALESCE(SUM(CASE WHEN l."liked" THEN 0 ELSE 1 END), 0)::INTEGER AS dislikes,
JSON_BUILD_OBJECT(
    'id', u."id",
    'userName', u."userName",
    'joinedAt', u."joinedAt",
    'avatarPath', u."avatarPath",
    'role', u."role",
    'visibility', u."visibility",
    'displayName', u."displayName",
    'bio', u."bio"
) AS user,
JSON_AGG(
    JSON_BUILD_OBJECT(
        'id', r."id",
        'postedAt', r."postedAt",
        'content', r."content",
        'replyTo', r."replyTo",
        'likeCount', r."likeCount",
        'lastEdited', r."lastEdited",
        'userId', r."userId",
        'user', JSON_BUILD_OBJECT(
            'id', r."userId",
            'userName', r."userName",
            'joinedAt', r."joinedAt",
            'avatarPath', r."avatarPath",
            'role', r."role",
            'visibility', r."visibility",
            'displayName', r."displayName",
            'bio', r."bio"
        )
    )
) AS replies
FROM "Post" AS p
CROSS JOIN LATERAL (
    SELECT *
    FROM "User" as u
    WHERE u."id" = p."userId"
) AS u
CROSS JOIN LATERAL (
    SELECT r.*, u."userName", u."joinedAt", u."avatarPath", u."role", u."visibility", u."displayName", u."bio"
    FROM "Post" AS r
    INNER JOIN "User" AS u ON u."id" = r."userId"
    WHERE r."replyTo" = p."id"
) AS r
CROSS JOIN LATERAL (
    SELECT * FROM "PostLike" AS l
    WHERE l."postId" = p."id"
) AS l
GROUP BY p."id", u."id", u."userName", u."joinedAt", u."avatarPath", u."role", u."visibility", u."displayName", u."bio"
ORDER BY p."postedAt" DESC;