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
