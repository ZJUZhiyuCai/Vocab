# PWA图标生成指南

## 方法1：使用浏览器工具（推荐）⭐

1. 在浏览器中打开已自动打开的页面：
   ```
   file:///D:/my-projects/vocab-context/scripts/generate-icons.html
   ```

2. 点击"下载192"和"下载512"按钮

3. 将下载的文件移动到：
   ```
   D:\my-projects\vocab-context\public\icon-192.png
   D:\my-projects\vocab-context\public\icon-512.png
   ```

---

## 方法2：在线工具生成

访问以下任一网站：

1. **RealFaviconGenerator**（推荐）
   https://realfavicongenerator.net/
   - 上传 `public/icon.svg`
   - 自动生成所有尺寸的图标
   - 下载后解压到public目录

2. **Favicon.io**
   https://favicon.io/
   - 选择"Text"或"Icon"
   - 输入"📚"或上传图片
   - 下载生成的图标包

3. **Canva**
   https://www.canva.com/
   - 创建512x512设计
   - 导出为PNG
   - 使用在线工具调整尺寸

---

## 方法3：使用Photoshop/GIMP

1. 打开 `public/icon.svg`
2. 导出为PNG，尺寸：
   - 192x192
   - 512x512
3. 保存到public目录

---

## 方法4：使用ImageMagick（命令行）

```bash
# 安装ImageMagick后运行：
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png
```

---

## 验证图标

生成后，检查文件是否存在：

```bash
ls -lh D:\my-projects\vocab-context\public\icon-*.png
```

应该看到：
- icon-192.png (约10-30KB)
- icon-512.png (约50-100KB)
