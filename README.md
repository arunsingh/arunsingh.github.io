# aruns.me

Personal site of **Arun Singh**. It's a Jekyll site inspired by [al-folio](https://github.com/alshedivat/al-folio), with a turquoise, white and charcoal palette and a dark mode. GitHub Pages builds it natively, so it needs no Actions and no custom plugins.

## Deploy to GitHub Pages (one time)

1. Create a **public** repo named exactly `arunsingh.github.io` on GitHub.
2. Push this folder:
   ```bash
   cd arunsingh.github.io
   git init -b main
   git add .
   git commit -m "Initial portfolio site"
   git remote add origin https://github.com/arunsingh/arunsingh.github.io.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages** and set **Source** to *Deploy from a branch*, then choose `main` and `/ (root)`.
4. **Custom domain `aruns.me`:** the `CNAME` file is already included. At your DNS provider, add:
   - Four `A` records for `@` pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`
   - (optional IPv6) `AAAA` records for `@` pointing to `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153` and `2606:50c0:8003::153`
   - A `CNAME` record for `www` pointing to `arunsingh.github.io`

   Then, under Settings → Pages, enter `aruns.me` and tick **Enforce HTTPS** once the certificate is issued (this can take up to about an hour).
5. *(Recommended)* Verify the domain under GitHub **Settings → Pages → Verified domains**. This stops anyone else from claiming it.

If you don't want the custom domain, delete `CNAME` and set `url: "https://arunsingh.github.io"` in `_config.yml`.

## Run locally

```bash
bundle install
bundle exec jekyll serve --livereload   # http://localhost:4000
```

## Where to edit things

| What | File |
|---|---|
| Name, tagline, location, nav order | `_config.yml` |
| Bio, "at a glance" numbers | `index.html` |
| News feed | `_data/news.yml` |
| **Essays** (Paul Graham style) | new file in `_essays/YYYY-MM-DD-slug.md` — copy `_essays/2026-09-17-essay-template.md` |
| Essays published elsewhere | `_data/essays_elsewhere.yml` |
| **Poems & short stories** — WordPress links | `_data/stories.yml` |
| Poems & stories written on this site | new file in `_poems/YYYY-MM-DD-slug.md` with `kind: poem` or `kind: story` |
| **Books** (series + chapters, bookshelf) | `_data/books.yml` |
| **Code** (OSS contributions, personal repos) | `_data/code.yml` |
| **Publications / preprints / workshop papers** | `_data/publications.yml` (PDFs in `assets/pdf/`, thumbnails in `assets/img/pubs/`) |
| Projects (cards) | `_data/projects.yml` + `assets/img/projects/` |
| Blog lists (Medium, Substack) | `_data/writing.yml` |
| CV, talks, skills, certifications | `_data/cv.yml`; PDF at `assets/pdf/Arun_Kumar_Singh_CV.pdf` |
| Social icons | `_data/socials.yml` |
| Colours and typography | top of `assets/css/main.css` (`:root` tokens) |

**Search** indexes everything above automatically (`search.json`). Press `/` or `Ctrl/⌘ K` on any page.

### Writing an essay
```markdown
---
title: How to Do Great Infrastructure Work
date: 2026-10-01
description: One sentence for search results and link previews.
---
Paragraphs, no subheadings. A footnote looks like this.[^1]

[^1]: Notes are collected at the end automatically.
```

**CV PDF:** replace `assets/pdf/Arun_Kumar_Singh_CV.pdf` to update the download on /cv/ (the current copy has the phone number and street address removed).
