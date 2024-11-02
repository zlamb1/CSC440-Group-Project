SELECT
    p."id", p."postedAt", p."content", p."replyTo", p."lastEdited", p."userId",
    (COALESCE(COUNT(CASE WHEN l."liked" THEN 1 END), 0) - COALESCE(COUNT(CASE WHEN NOT l."liked" THEN 1 END), 0))::INTEGER as "likeCount",
    COALESCE(COUNT(DISTINCT r."id"), 0)::INTEGER AS "replyCount",
    CASE
        WHEN COUNT(CASE WHEN l."userId" = $1::UUID THEN 1 END) = 0 THEN NULL
        WHEN COUNT(CASE WHEN l."userId" = $1::UUID AND l."liked" THEN 1 END) > 0 THEN TRUE ELSE FALSE
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
                'user',        r."user"
            )
        ) FILTER (WHERE r."id" IS NOT NULL),
        '[]'::jsonb
    ) as replies
FROM "Post" p
INNER JOIN "User" u ON u."id" = p."userId" AND (u."visibility" = 'PUBLIC' OR u."id" = $1::UUID)
LEFT JOIN "PostLike" l ON l."postId" = p."id"
LEFT JOIN LATERAL (
    SELECT
        r."id", r."postedAt", r."content", r."replyTo", r."lastEdited", r."userId",
        (COALESCE(COUNT(CASE WHEN l."liked" THEN 1 END), 0) - COALESCE(COUNT(CASE WHEN NOT l."liked" THEN 1 END), 0))::INTEGER as "likeCount",
        COALESCE(COUNT(DISTINCT rr."id"), 0)::INTEGER AS "replyCount",
        CASE
            WHEN COUNT(CASE WHEN l."userId" = $1::UUID THEN 1 END) = 0 THEN NULL
            WHEN COUNT(CASE WHEN l."userId" = $1::UUID AND l."liked" THEN 1 END) > 0 THEN TRUE ELSE FALSE
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
        ) AS user
    FROM "Post" r
    INNER JOIN "User" AS u ON u."id" = r."userId"
    LEFT JOIN "Post" AS rr ON rr."replyTo" = r."id"
    LEFT JOIN "PostLike" AS l ON l."postId" = r."id"
    WHERE r."replyTo" = p."id"
    GROUP BY r."id", u."id"
    ORDER BY r."postedAt" DESC
) r ON TRUE
WHERE p."replyTo" IS NULL
GROUP BY p."id", u."id"
ORDER BY p."postedAt" DESC