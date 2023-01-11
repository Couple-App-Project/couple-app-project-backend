import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ReferenceObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ResponseDto } from '../../common/dtos/response.dto';

/**
 * @paginated false
 * @response_type array
 * @response_dto single
 *
 * @param dataDto 타입 dto
 *
 * @example
 *
 * { succes: true, data: dataDto[] }
 */
export const ApiCustomArrayResponseByDto = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(ResponseDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
  );

/**
 * @paginated false
 * @response_type array
 * @response_dto multiple
 *
 * @param dataDto 타입별 dtos
 *
 * @example
 * type responseDto = dataDto1 | dataDto2 | ... dataDtoN
 *  { data: responseDto[] }
 */
export const ApiCustomArrayResponseByDtos = (...dataDto: any[]) => {
  const oneOfContainer: ReferenceObject[] = [];
  dataDto.map((dto) => oneOfContainer.push({ $ref: getSchemaPath(dto) }));

  return applyDecorators(
    ApiExtraModels(ResponseDto, ...dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                oneOf: oneOfContainer,
              },
            },
          },
        ],
      },
    }),
  );
};
