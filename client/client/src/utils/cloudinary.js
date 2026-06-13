export function optimizeImage(url, size = 'card') {
  if (!url || !url.includes('res.cloudinary.com')) return url
  const transforms = {
    card: 'w_400,h_400,c_fill,q_auto,f_auto',
    detail: 'w_800,q_auto,f_auto',
    thumb: 'w_100,h_100,c_fill,q_auto,f_auto',
    banner: 'w_1200,h_400,c_fill,q_auto,f_auto',
  }
  return url.replace('/upload/', `/upload/${transforms[size] || transforms.card}/`)
}
