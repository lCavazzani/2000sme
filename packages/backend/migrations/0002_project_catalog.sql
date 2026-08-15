PRAGMA foreign_keys = ON;

CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    project_year INTEGER NOT NULL CHECK (project_year BETWEEN 1970 AND 2100),
    publication_state TEXT NOT NULL DEFAULT 'draft' CHECK (publication_state IN ('draft', 'published')),
    sort_order INTEGER NOT NULL UNIQUE CHECK (sort_order >= 0),
    thumbnail_ref TEXT NOT NULL CHECK (
        thumbnail_ref NOT LIKE 'http://%'
        AND thumbnail_ref NOT LIKE 'https://%'
    ),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE project_technologies (
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    technology TEXT NOT NULL,
    sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
    PRIMARY KEY (project_id, technology),
    UNIQUE (project_id, sort_order)
);

CREATE TABLE project_links (
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL CHECK (url LIKE 'https://%'),
    sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
    PRIMARY KEY (project_id, label),
    UNIQUE (project_id, sort_order)
);

CREATE INDEX idx_projects_publication_sort
    ON projects(publication_state, sort_order, project_year DESC);
CREATE INDEX idx_project_technologies_project_sort
    ON project_technologies(project_id, sort_order);
CREATE INDEX idx_project_links_project_sort
    ON project_links(project_id, sort_order);

-- Future public project endpoints must select from this view rather than the
-- base table so draft and unpublished records never enter the public contract.
CREATE VIEW published_projects AS
SELECT
    id,
    slug,
    name,
    summary,
    description,
    project_year,
    sort_order,
    thumbnail_ref,
    created_at,
    updated_at
FROM projects
WHERE publication_state = 'published';

-- Repeatable seed fixture. Keeping it idempotent allows local development and
-- Workers-runtime tests to recreate the canonical catalog safely.
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
        'A Windows desktop-inspired personal portfolio.',
        'Personal portfolio built as a Windows 98 desktop simulation. Features draggable/resizable windows, theme switching between Win98, WinXP, and Win7, a Cloudflare Workers API with D1, rate-limited guestbook, and a pnpm monorepo with GitHub Actions CI/CD.',
        2026,
        'published',
        0,
        '/desktop-icons/my-computer.svg',
        '2026-08-12T00:00:00Z',
        '2026-08-12T00:00:00Z'
    ),
    (
        'project-alpha',
        'project-alpha',
        'Project Alpha',
        'A placeholder Node.js and PostgreSQL project showcase.',
        'Replace with a real project description.',
        2025,
        'published',
        1,
        '/desktop-icons/my-computer.svg',
        '2026-08-12T00:00:00Z',
        '2026-08-12T00:00:00Z'
    ),
    (
        'project-beta',
        'project-beta',
        'Project Beta',
        'A placeholder Python and FastAPI project showcase.',
        'Replace with a real project description.',
        2024,
        'published',
        2,
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

INSERT INTO project_technologies (project_id, technology, sort_order) VALUES
    ('sportifolio', 'React', 0),
    ('sportifolio', 'TypeScript', 1),
    ('sportifolio', 'Cloudflare Workers', 2),
    ('sportifolio', 'Hono', 3),
    ('sportifolio', 'D1', 4),
    ('sportifolio', 'Vite', 5),
    ('sportifolio', 'pnpm', 6),
    ('project-alpha', 'Node.js', 0),
    ('project-alpha', 'TypeScript', 1),
    ('project-alpha', 'PostgreSQL', 2),
    ('project-alpha', 'Docker', 3),
    ('project-beta', 'Python', 0),
    ('project-beta', 'FastAPI', 1),
    ('project-beta', 'Redis', 2),
    ('project-beta', 'Terraform', 3)
ON CONFLICT(project_id, technology) DO UPDATE SET
    sort_order = excluded.sort_order;

INSERT INTO project_links (project_id, label, url, sort_order) VALUES
    ('sportifolio', 'GitHub', 'https://github.com/lCavazzani/2000sme', 0),
    ('sportifolio', 'Live', 'https://2000sme.cavazzanileonardo.workers.dev', 1),
    ('project-alpha', 'GitHub', 'https://github.com/lCavazzani', 0),
    ('project-beta', 'GitHub', 'https://github.com/lCavazzani', 0)
ON CONFLICT(project_id, label) DO UPDATE SET
    url = excluded.url,
    sort_order = excluded.sort_order;
