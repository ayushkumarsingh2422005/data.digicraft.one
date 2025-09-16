import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function listDirectory(dirPath, relBase = "") {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const visible = entries.filter((e) => !e.name.startsWith("."));
  visible.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });
  return visible.map((e) => {
    const rel = relBase ? `${relBase}/${e.name}` : `/${e.name}`;
    return {
      type: e.isDirectory() ? "dir" : "file",
      name: e.name,
      relPath: rel,
      url: rel,
    };
  });
}

function isImage(fileName) {
  return /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.bmp|\.svg)$/i.test(fileName);
}

function isVideo(fileName) {
  return /(\.mp4|\.webm|\.ogg|\.mov|\.m4v)$/i.test(fileName);
}

function isPdf(fileName) {
  return /(\.pdf)$/i.test(fileName);
}

function FileItem({ node }) {
  const commonLink = "text-blue-600 hover:underline break-all";
  const wrapper = "mt-1";
  if (isPdf(node.name)) {
    return (
      <div className={wrapper}>
        <a href={node.url} target="_blank" rel="noopener noreferrer" className={commonLink}>
          📄 {node.name}
        </a>
        <a href={node.url} download className="ml-3 text-sm text-gray-600 hover:text-gray-800">
          Download
        </a>
      </div>
    );
  }
  if (isImage(node.name)) {
    return (
      <div className={`${wrapper} group`}>
        <div className="flex items-center gap-2">
          <span>🖼️</span>
          <span className="font-medium">{node.name}</span>
          <a href={node.url} download className="ml-2 text-xs text-gray-600 hover:text-gray-800">
            Download
          </a>
        </div>
        <img
          src={node.url}
          alt={node.name}
          className="mt-2 max-h-56 rounded border border-gray-200 shadow-sm"
          loading="lazy"
        />
      </div>
    );
  }
  if (isVideo(node.name)) {
    return (
      <div className={wrapper}>
        <div className="flex items-center gap-2">
          <span>🎞️</span>
          <span className="font-medium">{node.name}</span>
          <a href={node.url} download className="ml-2 text-xs text-gray-600 hover:text-gray-800">
            Download
          </a>
        </div>
        <video
          src={node.url}
          className="mt-2 w-full max-w-3xl rounded border border-gray-200 shadow-sm"
          controls
          preload="metadata"
        />
      </div>
    );
  }
  return (
    <div className={wrapper}>
      <a
        href={node.url}
        className={commonLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        📎 {node.name}
      </a>
      <a href={node.url} download className="ml-3 text-sm text-gray-600 hover:text-gray-800">
        Download
      </a>
    </div>
  );
}
function Breadcrumb({ relPath }) {
  const cleaned = relPath.replace(/^\/+/, "");
  const parts = cleaned ? cleaned.split("/").filter(Boolean) : [];
  const crumbs = [{ name: "Home", href: "/" }];
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    crumbs.push({ name: part, href: `/?path=${encodeURIComponent(acc)}` });
  }
  return (
    <nav className="flex items-center flex-wrap gap-1 text-sm text-gray-700">
      {crumbs.map((c, idx) => (
        <span key={`${c.href}-${idx}`} className="flex items-center gap-1">
          {idx > 0 && <span className="text-gray-400">/</span>}
          <a href={c.href} className="hover:underline">
            {c.name}
          </a>
        </span>
      ))}
    </nav>
  );
}

function FolderList({ items, currentRelPath }) {
  const folders = items.filter((i) => i.type === "dir");
  const files = items.filter((i) => i.type === "file");
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-600 mb-2">Folders</h2>
        {folders.length === 0 ? (
          <p className="text-gray-500 text-sm">No folders</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {folders.map((f) => (
              <li key={`dir-${f.relPath}`} className="">
                <a
                  href={`/?path=${encodeURIComponent(f.relPath)}`}
                  className="flex items-center gap-2 rounded border border-gray-200 bg-white p-3 shadow-sm hover:bg-gray-50"
                >
                  <span>📁</span>
                  <span className="font-medium truncate">{f.name}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-600 mb-2">Files</h2>
        {files.length === 0 ? (
          <p className="text-gray-500 text-sm">No files</p>
        ) : (
          <ul className="space-y-3">
            {files.map((file) => (
              <li key={`file-${file.relPath}`} className="rounded border border-gray-200 bg-white p-3 shadow-sm">
                <FileItem node={file} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const rawPath = typeof sp?.path === "string" ? sp.path : "";
  const noNull = (rawPath || "").replace(/\0/g, "");
  const forwardSlashes = noNull.replace(/\\/g, "/");
  let safeRel = path.posix.normalize(forwardSlashes);
  if (safeRel === "." || safeRel === "./" || safeRel === "/") safeRel = "";
  if (safeRel.startsWith("..")) safeRel = "";

  const abs = path.join(PUBLIC_DIR, safeRel);
  let currentAbs = abs;
  if (!abs.startsWith(PUBLIC_DIR)) {
    currentAbs = PUBLIC_DIR;
    safeRel = "";
  }
  let items = [];
  if (fs.existsSync(currentAbs)) {
    try {
      items = listDirectory(currentAbs, safeRel);
    } catch (e) {
      items = [];
    }
  }

  const parentRel = (() => {
    const cleaned = safeRel.replace(/^\/+/, "");
    const parts = cleaned.split("/").filter(Boolean);
    parts.pop();
    const parent = parts.length ? `/${parts.join("/")}` : "";
    return parent;
  })();

  return (
    <main className="p-6 font-sans">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold mb-2">Public Files Browser</h1>
        <div className="flex items-center justify-between mb-3">
          <Breadcrumb relPath={safeRel} />
          <div className="flex items-center gap-2">
            {safeRel ? (
              <a
                href={parentRel ? `/?path=${encodeURIComponent(parentRel)}` : "/"}
                className="rounded border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-gray-50"
              >
                ⬆️ Up
              </a>
            ) : null}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          {items.length === 0 ? (
            <p className="text-gray-500">This folder is empty.</p>
          ) : (
            <FolderList items={items} currentRelPath={safeRel} />
          )}
        </div>
      </div>
    </main>
  );
}
