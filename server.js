const { cloudinary } = require('./utils/cloudinary');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();
var cors = require('cors');

app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.get('/api/images', async (req, res) => {
  const { resources } = await cloudinary.search
    .expression('folder:gobybus')
    .sort_by('public_id', 'desc')
    .max_results(30)
    .execute();

  const publicIds = resources.map((file) => file.public_id);
  res.send(resources);
});

const uploadFiles = async (req, res, next) => {
  try {
    const { description } = req.body;
    const fileStr = req.files[0].path;

    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: 'gobybus',
    });

    res.json({ msg: 'File uploaded sucessfully', data: { description, fileUrl: uploadResponse.url } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: 'Something went wrong' });
  }
};

app.post('/api/upload', upload.array('files'), uploadFiles);

app.delete('/api/imageDestroy', async (req, res) => {
  try {
    const imageName = req.body.data;
    const imageDestroyResponse = await cloudinary.uploader.destroy(imageName);

    console.log(`Destroy file '${imageName}' from CLOUDINARY: ===========>>>>>>>>>>> `, imageDestroyResponse);
    res.json(imageDestroyResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: 'Something went wrong' });
  }
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log('listening on 5001');
});
