import { Link } from 'react-router-dom';
import qs from 'qs';
import navigation from '../navigation.json';

export default function PageIndex() {
  return (
    <div>
      <h1>分享博客React相关的示例代码demo</h1>
      {navigation.map((item) => {
        return (
          <div>
            <h2>{item.title}</h2>
            <ul>
              {item.children.map((page) => {
                if (typeof page === 'string') {
                  let link = [item.basePath, page].join('/');
                  if (item.baseParams) {
                    link += `?${qs.stringify(item.baseParams)}`;
                  }

                  return (
                    <li>
                      <Link to={link}>{page}</Link>
                    </li>
                  );
                }

                return null;
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
