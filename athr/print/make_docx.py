"""Builds a Word letterhead template (A4) with the printed design as a full-page background.
Run: python3 athr/print/make_docx.py   (after build.js; needs python-docx)"""
import os, copy
from docx import Document
from docx.shared import Mm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = os.path.dirname(os.path.abspath(__file__))
BG = os.path.join(HERE, "out", "preview_letterhead.png")
OUT = os.path.join(HERE, "out", "ATHR_Letterhead_A4_Word.docx")

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Mm(210), Mm(297)
sec.top_margin, sec.bottom_margin = Mm(58), Mm(30)
sec.left_margin = sec.right_margin = Mm(18)
sec.header_distance = sec.footer_distance = Mm(0)

# full-page background picture, anchored in the header behind the text
hp = sec.header.paragraphs[0]
run = hp.add_run()
run.add_picture(BG, width=Mm(210), height=Mm(297))
inline = run._r.find(".//" + qn("wp:inline"))
anchor = OxmlElement("wp:anchor")
for k, v in dict(distT="0", distB="0", distL="0", distR="0", simplePos="0", relativeHeight="0",
                 behindDoc="1", locked="1", layoutInCell="1", allowOverlap="1").items():
    anchor.set(k, v)
sp = OxmlElement("wp:simplePos"); sp.set("x", "0"); sp.set("y", "0"); anchor.append(sp)
for tag, rel in (("wp:positionH", "page"), ("wp:positionV", "page")):
    pos = OxmlElement(tag); pos.set("relativeFrom", rel)
    off = OxmlElement("wp:posOffset"); off.text = "0"; pos.append(off); anchor.append(pos)
for child in list(inline):
    if child.tag == qn("wp:extent"):
        anchor.append(copy.deepcopy(child))
        ee = OxmlElement("wp:effectExtent")
        for s in ("l", "t", "r", "b"):
            ee.set(s, "0")
        anchor.append(ee)
        anchor.append(OxmlElement("wp:wrapNone"))
    elif child.tag in (qn("wp:docPr"), qn("wp:cNvGraphicFramePr"), qn("a:graphic")):
        anchor.append(copy.deepcopy(child))
inline.getparent().replace(inline, anchor)

# body: right-to-left Arabic text style
st = doc.styles["Normal"]
st.font.name = "Arial"; st.font.size = Pt(12); st.font.color.rgb = RGBColor(0x1B, 0x1F, 0x3A)
st.element.rPr.rFonts.set(qn("w:cs"), "Arial")
p = doc.paragraphs[0] if doc.paragraphs else doc.add_paragraph()
# bidi paragraph: default alignment is the right edge
pPr = p._p.get_or_add_pPr(); bidi = OxmlElement("w:bidi"); pPr.append(bidi)
r = p.add_run("اكتب نص الخطاب هنا")
rPr = r._r.get_or_add_rPr(); rtl = OxmlElement("w:rtl"); rPr.append(rtl)
doc.save(OUT)
print("saved", OUT)
