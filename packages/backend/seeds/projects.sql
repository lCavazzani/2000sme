PRAGMA foreign_keys = ON;

-- This is intentional fixture data, not database history. Run it explicitly
-- after migrations when a local or approved remote environment needs the
-- canonical project catalog.
INSERT INTO projects (
    id,
    slug,
    name,
    summary,
    description,
    project_year,
    publication_state,
    sort_order,
    thumbnail_ref,
    created_at,
    updated_at
) VALUES
    (
        'sportifolio',
        'sportifolio',
        '00sportifolio',
        'An interactive pixel-art desktop portfolio.',
        'Personal portfolio built as PixelOS, an interactive pixel-art desktop environment. Features draggable and resizable windows, a registry-driven application shell, playable Minesweeper and NIGHTSHIFT games, a Cloudflare Workers API with D1, and a pnpm monorepo with GitHub Actions CI/CD.',
        2026,
        'published',
        0,
        '/desktop-icons/my-computer.svg',
        '2026-08-12T00:00:00Z',
        '2026-08-12T00:00:00Z'
    )
ON CONFLICT(id) DO UPDATE SET
    slug = excluded.slug,
    name = excluded.name,
    summary = excluded.summary,
    description = excluded.description,
    project_year = excluded.project_year,
    publication_state = excluded.publication_state,
    sort_order = excluded.sort_order,
    thumbnail_ref = excluded.thumbnail_ref,
    updated_at = excluded.updated_at;

-- Retire the placeholder projects that earlier revisions of this seed inserted.
-- Removing them from the INSERT above is not enough: a database seeded before
-- that change still holds the rows, and the catalog query returns every
-- published project. Child rows go first to respect the foreign keys.
DELETE FROM project_technologies
WHERE project_id IN ('project-alpha', 'project-beta');

DELETE FROM project_links
WHERE project_id IN ('project-alpha', 'project-beta');

DELETE FROM projects
WHERE id IN ('project-alpha', 'project-beta');

-- Replace child records for the catalog fixtures so repeatable local seeds do
-- not retain stale technology or link rows after the fixture changes.
DELETE FROM project_technologies
WHERE project_id = 'sportifolio';

INSERT INTO project_technologies (project_id, technology, sort_order) VALUES
    ('sportifolio', 'React', 0),
    ('sportifolio', 'TypeScript', 1),
    ('sportifolio', 'Cloudflare Workers', 2),
    ('sportifolio', 'Hono', 3),
    ('sportifolio', 'D1', 4),
    ('sportifolio', 'Vite', 5),
    ('sportifolio', 'pnpm', 6);

DELETE FROM project_links
WHERE project_id = 'sportifolio';

INSERT INTO project_links (project_id, label, url, sort_order) VALUES
    ('sportifolio', 'GitHub', 'https://github.com/lCavazzani/2000sme', 0),
    ('sportifolio', 'Live', 'https://2000sme.cavazzanileonardo.workers.dev', 1);
