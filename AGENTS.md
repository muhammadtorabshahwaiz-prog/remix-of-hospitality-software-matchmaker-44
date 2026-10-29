<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Shared site chrome (Nav, Footer, CompareTray, motion layers) is mounted once in `src/routes/__root.tsx`; pages only render their own content — keeps one consistent shell.
- Placeholder providers/reviews live in `src/data/site.ts` and must be labeled with `<Sample />` in UI until real data replaces them.
- Motion primitives live in `src/components/fx.tsx` and must respect prefers-reduced-motion — one place to tune performance.
