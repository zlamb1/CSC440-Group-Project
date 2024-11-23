-- @param {String} $1:userId
-- @param {String} $2:viewerId
-- @param {DateTime} $3:cursor
-- @param {Int} $4:limit
SELECT
    p."id", p."postedAt", p."content", p."replyTo", p."lastEdited", p."userId",
    (COALESCE(COUNT(DISTINCT l) FILTER (WHERE l."liked"), 0) - COALESCE(COUNT(DISTINCT l) FILTER (WHERE NOT l."liked"), 0))::INTEGER as "likeCount",
    COALESCE(COUNT(DISTINCT r."id"), 0)::INTEGER AS "replyCount",
    CASE
        WHEN COUNT(CASE WHEN l."userId" = $2::UUID THEN 1 END) = 0 THEN NULL
        WHEN COUNT(CASE WHEN l."userId" = $2::UUID AND l."liked" THEN 1 END) > 0 THEN TRUE ELSE FALSE
    END AS liked,
    JSONB_BUILD_OBJECT(
        'id',           u."id",
        'userName',     u."userName",
        'joinedAt',     u."joinedAt",
        'avatarPath',   u."avatarPath",
        'role',         u."role",
        'visibility',   u."visibility",
        'displayName',  u."displayName",
        'bio',          u."bio"
    ) AS user,
    COALESCE(
        JSONB_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id',          r."id",
                'postedAt',    r."postedAt",
                'content',     r."content",
                'replyTo',     r."replyTo",
                'lastEdited',  r."lastEdited",
                'userId',      r."userId",
                'likeCount',   r."likeCount",
                'replyCount',  r."replyCount",
                'liked',       r."liked",
                'user',        r."user",
                'genres',      r."genres"
            )
        ) FILTER (WHERE r."id" IS NOT NULL),
        '[]'::jsonb
    ) as replies,
    COALESCE(JSONB_AGG(DISTINCT g."genre") FILTER (WHERE g."genre" IS NOT NULL), '[]'::jsonb) AS "genres"
FROM "Post" p
INNER JOIN "User" u ON u."id" = p."userId" AND (u."visibility" = 'PUBLIC' OR u."id" = $1::UUID)
INNER JOIN "PostLike" pl ON pl."postId" = p."id" AND pl."userId" = $1::UUID AND pl."liked"
LEFT JOIN "PostLike" l ON l."postId" = p."id"
LEFT JOIN "PostGenre" g ON g."postId" = p."id"
LEFT JOIN LATERAL (
    SELECT
        r."id", r."postedAt", r."content", r."replyTo", r."lastEdited", r."userId",
        (COALESCE(COUNT(DISTINCT l) FILTER (WHERE l."liked"), 0) - COALESCE(COUNT(DISTINCT l) FILTER (WHERE NOT l."liked"), 0))::INTEGER as "likeCount",
        COALESCE(COUNT(DISTINCT rr."id"), 0)::INTEGER AS "replyCount",
        CASE
            WHEN COUNT(CASE WHEN l."userId" = $2::UUID THEN 1 END) = 0 THEN NULL
            WHEN COUNT(CASE WHEN l."userId" = $2::UUID AND l."liked" THEN 1 END) > 0 THEN TRUE ELSE FALSE
        END AS liked,
        JSONB_BUILD_OBJECT(
            'id',           u."id",
            'userName',     u."userName",
            'joinedAt',     u."joinedAt",
            'avatarPath',   u."avatarPath",
            'role',         u."role",
            'visibility',   u."visibility",
            'displayName',  u."displayName",
            'bio',          u."bio"
        ) AS user,
        COALESCE(JSONB_AGG(DISTINCT g."genre") FILTER (WHERE g."genre" IS NOT NULL), '[]'::jsonb) AS "genres"
    FROM "Post" r
    INNER JOIN "User" AS u ON u."id" = r."userId"
    LEFT JOIN "Post" AS rr ON rr."replyTo" = r."id"
    LEFT JOIN "PostLike" AS l ON l."postId" = r."id"
    LEFT JOIN "PostGenre" AS g ON g."postId" = r."id"
    WHERE r."replyTo" = p."id"
    GROUP BY r."id", u."id"
    ORDER BY r."postedAt" DESC
) r ON TRUE
WHERE p."replyTo" IS NULL AND p."postedAt" < $3::TIMESTAMP
GROUP BY p."id", u."id"
ORDER BY p."postedAt" DESC
LIMIT $4::INTEGER