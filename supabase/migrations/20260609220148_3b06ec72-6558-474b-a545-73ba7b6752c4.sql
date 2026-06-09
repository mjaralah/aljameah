DELETE FROM public.about_content WHERE section_key = 'values';
UPDATE public.about_content SET title='الرؤية', sort_order=2 WHERE section_key='vision';
UPDATE public.about_content SET title='الرسالة', sort_order=3,
  data='{"values":[{"icon":"Heart","title":"الإحسان","desc":"نعمل بإخلاص لخدمة الإنسان."},{"icon":"ShieldCheck","title":"الأمانة","desc":"نحفظ ما يُؤتمن إلينا بمسؤولية."},{"icon":"Handshake","title":"التعاون","desc":"نُؤمن بأن الأثر الكبير ثمرة عمل جماعي."},{"icon":"Lightbulb","title":"الإبداع","desc":"نبتكر حلولاً مستدامة لتحديات المجتمع."}]}'::jsonb
WHERE section_key='mission';