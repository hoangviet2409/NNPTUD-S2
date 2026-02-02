module.exports = {
    ConvertTitleToSlug: function (title) {
        // Convert to lowercase
        let result = title.toLowerCase();
        
        // Replace Vietnamese characters
        result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        result = result.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        result = result.replace(/đ/g, 'd');
        
        // Replace special characters with hyphens
        result = result.replace(/[^a-z0-9]+/g, '-');
        
        // Remove leading and trailing hyphens
        result = result.replace(/^-+|-+$/g, '');
        
        return result;
    }
}
